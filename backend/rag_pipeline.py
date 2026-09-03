"""
=============================================================================
 rag_pipeline.py  —  BUILDS THE SEARCHABLE KNOWLEDGE BASE
=============================================================================

WHAT THIS FILE DOES (in one sentence):
    It reads all your lecture PDFs, breaks them into small pieces, converts
    each piece into numbers ("embeddings"), and saves them in a searchable
    database (FAISS) so the AI can later find relevant course content fast.

WHEN IT RUNS:
    You run this ONCE (or whenever you add new course PDFs). It is NOT the
    live server — it just prepares the data. Command:  python rag_pipeline.py

THE BIG PICTURE:
    PDFs  ->  text  ->  chunks  ->  vectors  ->  FAISS index (saved to disk)
=============================================================================
"""

import os
import pickle                                    # saves Python objects to disk
from pathlib import Path                         # handles file paths cleanly
from sentence_transformers import SentenceTransformer  # converts text -> vectors
import faiss                                     # Facebook AI Similarity Search
import numpy as np

# pypdf reads text out of PDF files. We try the new name first, old name second.
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader


# ---------------------------------------------------------------------------
# CONFIGURATION  —  the settings that control how the pipeline behaves
# ---------------------------------------------------------------------------
CONTENT_DIR = Path("course_content")   # folder holding your PDFs (per course)
VECTOR_DB_DIR = Path("vector_db")      # folder where the finished index is saved
EMBEDDING_MODEL = "all-MiniLM-L6-v2"   # the model that turns text into vectors.
                                       # Small, fast, runs on CPU, 384 numbers
                                       # per chunk. Good balance for this project.
CHUNK_SIZE = 400        # each chunk is 400 characters long
CHUNK_OVERLAP = 80      # consecutive chunks share 80 characters, so a sentence
                        # that gets split across a boundary is still captured
                        # whole in at least one chunk.

VECTOR_DB_DIR.mkdir(exist_ok=True)     # create the output folder if missing


# ---------------------------------------------------------------------------
# STEP 1  —  EXTRACT TEXT FROM A SINGLE PDF
# ---------------------------------------------------------------------------
def extract_text_from_pdf(filepath):
    """Open one PDF and return all its text as a single string."""
    try:
        reader = PdfReader(str(filepath))
        text = ""
        for page in reader.pages:              # go through every page
            extracted = page.extract_text()    # pull the text off the page
            if extracted:                      # some pages (images) have none
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        # If a PDF is corrupt or unreadable, warn but don't crash the whole run
        print(f"  Warning: could not read {filepath.name}: {e}")
        return ""


# ---------------------------------------------------------------------------
# STEP 2  —  LOAD EVERY PDF AND SPLIT INTO CHUNKS
# ---------------------------------------------------------------------------
def load_and_chunk(content_dir: Path):
    """
    Walk through all PDFs (and any .txt files), extract their text,
    and cut each document into overlapping 400-character chunks.

    Returns two parallel lists:
      chunks   -> the actual text pieces
      metadata -> where each piece came from (filename, course)
    """
    chunks = []
    metadata = []

    # --- Process every PDF found anywhere under course_content/ ---
    pdf_files = list(content_dir.rglob("*.pdf"))   # rglob = search subfolders too
    print(f"Found {len(pdf_files)} PDF files")

    for filepath in pdf_files:
        print(f"  Reading: {filepath.name}")
        text = extract_text_from_pdf(filepath)
        if not text:
            continue                              # skip empty/unreadable PDFs

        course = filepath.parent.name             # folder name = course code
        filename = filepath.stem                  # file name without ".pdf"

        # Slide a window across the text, stepping forward by (size - overlap)
        # so each new chunk overlaps the previous one by CHUNK_OVERLAP chars.
        for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP):
            chunk = text[i:i + CHUNK_SIZE].strip()
            if len(chunk) > 60:                   # ignore tiny leftover fragments
                chunks.append(chunk)
                metadata.append({
                    "source": filename,
                    "course": course,
                    "chunk_id": len(chunks)
                })

    # --- Also process any plain .txt files (optional extra content) ---
    txt_files = list(content_dir.rglob("*.txt"))
    for filepath in txt_files:
        text = filepath.read_text(encoding="utf-8", errors="ignore")
        course = filepath.parent.name
        filename = filepath.stem
        for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP):
            chunk = text[i:i + CHUNK_SIZE].strip()
            if len(chunk) > 60:
                chunks.append(chunk)
                metadata.append({"source": filename, "course": course,
                                 "chunk_id": len(chunks)})

    print(f"\nTotal chunks created: {len(chunks)}")
    return chunks, metadata


# ---------------------------------------------------------------------------
# STEP 3  —  CONVERT CHUNKS INTO EMBEDDINGS (VECTORS)
# ---------------------------------------------------------------------------
def embed_chunks(chunks):
    """
    Turn each text chunk into a vector of 384 numbers.
    Chunks with similar meaning get similar vectors — that's what lets us
    later search "by meaning" instead of "by exact keyword".
    """
    print("Loading embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print(f"Embedding {len(chunks)} chunks...")
    # batch_size=64 means it processes 64 chunks at a time for speed
    embeddings = model.encode(chunks, show_progress_bar=True, batch_size=64)
    return embeddings, model


# ---------------------------------------------------------------------------
# STEP 4  —  BUILD THE FAISS SEARCH INDEX
# ---------------------------------------------------------------------------
def build_index(embeddings):
    """
    Put all the vectors into a FAISS index so we can search them instantly.
    IndexFlatL2 measures the straight-line (L2 / Euclidean) distance between
    vectors — smaller distance means more similar meaning.
    """
    dim = embeddings.shape[1]              # 384 for this embedding model
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype("float32"))  # FAISS needs 32-bit floats
    print(f"FAISS index built - {index.ntotal} vectors, dim={dim}")
    return index


# ---------------------------------------------------------------------------
# STEP 5  —  SAVE EVERYTHING TO DISK
# ---------------------------------------------------------------------------
def save(index, chunks, metadata):
    """
    Save two things:
      index.faiss  -> the searchable vectors
      chunks.pkl   -> the original text + metadata (FAISS only stores numbers,
                      so we keep the actual text separately, lined up by order)
    """
    faiss.write_index(index, str(VECTOR_DB_DIR / "index.faiss"))
    with open(VECTOR_DB_DIR / "chunks.pkl", "wb") as f:
        pickle.dump({"chunks": chunks, "metadata": metadata}, f)
    print(f"Saved to {VECTOR_DB_DIR}/")


# ---------------------------------------------------------------------------
# HELPER  —  used to TEST retrieval after building (and reused by the API)
# ---------------------------------------------------------------------------
def load_index():
    """Load the saved index and text back from disk."""
    index = faiss.read_index(str(VECTOR_DB_DIR / "index.faiss"))
    with open(VECTOR_DB_DIR / "chunks.pkl", "rb") as f:
        data = pickle.load(f)
    return index, data["chunks"], data["metadata"]


def retrieve(query: str, top_k: int = 5):
    """
    Given a question, find the top_k most relevant chunks.
    This is the 'R' (Retrieval) in RAG.
    """
    model = SentenceTransformer(EMBEDDING_MODEL)
    index, chunks, metadata = load_index()
    q_emb = model.encode([query]).astype("float32")   # question -> vector
    distances, indices = index.search(q_emb, top_k)    # find closest chunks
    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx < len(chunks):
            results.append({"chunk": chunks[idx],
                            "metadata": metadata[idx],
                            "score": float(dist)})
    return results


# ---------------------------------------------------------------------------
# MAIN  —  runs when you type: python rag_pipeline.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    chunks, metadata = load_and_chunk(CONTENT_DIR)   # 1+2: read & chunk
    if not chunks:
        print("No content found. Add PDFs to course_content/ first.")
        exit(1)
    embeddings, model = embed_chunks(chunks)         # 3: embed
    index = build_index(embeddings)                  # 4: index
    save(index, chunks, metadata)                    # 5: save

    # Quick sanity test — retrieve something to prove it works
    print("\nTesting retrieval...")
    for r in retrieve("lecture topics"):
        print(f"\n[{r['metadata']['source']}] {r['chunk'][:150]}")
