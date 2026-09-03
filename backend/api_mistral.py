import pickle
import torch
import faiss
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

VECTOR_DB_DIR = Path("vector_db")
COURSE_CONTENT_DIR = Path("course_content")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

app = FastAPI(title="AcademIQ AI Backend with Mistral 7B")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

print("Loading embedding model...")
embedder = SentenceTransformer(EMBEDDING_MODEL)

print("Loading FAISS index...")
index = faiss.read_index(str(VECTOR_DB_DIR / "index.faiss"))
with open(VECTOR_DB_DIR / "chunks.pkl", "rb") as f:
    data = pickle.load(f)
chunks = data["chunks"]
metadata = data["metadata"]
print(f"Loaded {index.ntotal} vectors")

print("Loading Mistral 7B in 4-bit...")
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)
tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL)
model = AutoModelForCausalLM.from_pretrained(LLM_MODEL, quantization_config=bnb_config, device_map="auto")
print("Mistral 7B loaded and ready!")

class AskRequest(BaseModel):
    question: str
    course: str = "COMP516"
    top_k: int = 5

class AskResponse(BaseModel):
    answer: str
    sources: list

class SolveRequest(BaseModel):
    question: str
    course: str = "COMP516"
    mode: str = "solve"

def retrieve(question: str, top_k: int = 5):
    q_emb = embedder.encode([question]).astype("float32")
    distances, indices = index.search(q_emb, top_k)
    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx < len(chunks):
            results.append({"chunk": chunks[idx], "source": metadata[idx].get("source", "unknown"), "score": float(dist)})
    return results

def generate(question: str, context_chunks: list, course: str) -> str:
    context = "\n\n".join([f"[{c['source']}]: {c['chunk']}" for c in context_chunks])
    prompt = f"""<s>[INST] You are an expert AI tutor for {course} at the University of Liverpool.

Answer ONLY based on the course material provided. If the question cannot be answered from it, say so clearly. Explain clearly for a postgraduate student. Never confuse technical terms across domains.

Course material:
{context}

Student question: {question}

Provide a clear, helpful answer based strictly on the course material above: [/INST]"""
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=350, temperature=0.7, do_sample=True, repetition_penalty=1.1)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.split("[/INST]")[-1].strip() if "[/INST]" in response else response[len(prompt):].strip()

@app.get("/")
def root():
    return {"status": "AcademIQ Mistral 7B backend running", "vectors": index.ntotal}

@app.get("/health")
def health():
    return {"status": "ok", "model": "Mistral-7B-Instruct-v0.2", "vectors": index.ntotal}

@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    context = retrieve(req.question, req.top_k)
    answer = generate(req.question, context, req.course)
    return AskResponse(answer=answer, sources=list(set([c["source"] for c in context])))

@app.get("/documents/{course}")
def list_documents(course: str):
    course_dir = COURSE_CONTENT_DIR / course
    if not course_dir.exists():
        return {"documents": []}
    pdfs = [f.name for f in course_dir.glob("*.pdf")]
    return {"course": course, "documents": sorted(pdfs)}

@app.get("/pdf/{course}/{filename}")
def get_pdf(course: str, filename: str):
    filepath = COURSE_CONTENT_DIR / course / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(str(filepath), media_type="application/pdf")

@app.get("/pdf-text/{course}/{filename}")
def get_pdf_text(course: str, filename: str):
    from pypdf import PdfReader
    filepath = COURSE_CONTENT_DIR / course / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="PDF not found")
    reader = PdfReader(str(filepath))
    pages = [{"page": i + 1, "text": (page.extract_text() or "")} for i, page in enumerate(reader.pages)]
    return {"filename": filename, "pages": pages, "total_pages": len(pages)}

@app.post("/solve")
def solve(req: SolveRequest):
    context = retrieve(req.question, top_k=5)
    ctx_text = "\n\n".join([f"[{c['source']}]: {c['chunk']}" for c in context])
    if req.mode == "realworld":
        instruction = "Explain how this concept is used in the REAL WORLD. Give concrete industry examples and why it matters for a student's future career. Be engaging and motivating."
    elif req.mode == "solve":
        instruction = "Provide a clear STEP-BY-STEP solution. If it is a maths or coding problem, show each step of the working and explain the reasoning. Number each step."
    else:
        instruction = "Explain this concept clearly and simply, as a tutor would."
    prompt = f"""<s>[INST] You are an expert AI tutor for {req.course} at the University of Liverpool.

{instruction}

Use this course material as context:
{ctx_text}

Question/topic: {req.question} [/INST]"""
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=400, temperature=0.7, do_sample=True, repetition_penalty=1.1)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    answer = response.split("[/INST]")[-1].strip() if "[/INST]" in response else response[len(prompt):].strip()
    return {"answer": answer, "mode": req.mode, "sources": list(set([c["source"] for c in context]))}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
