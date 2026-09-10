# AcademIQ
🌐 **Live demo:** [academiq-seven.vercel.app](https://academiq-seven.vercel.app)
**A course-aware AI tutor embedded directly inside a learning platform.**

AcademIQ is an AI-powered learning platform built as an MSc dissertation
project at the University of Liverpool. Instead of sending students away
from their lecture material to search for help, AcademIQ brings a
retrieval-grounded AI tutor directly into the page a student is already
reading — and constrains it to only answer from that student's own,
real course content.

## Why

Traditional learning management systems like Canvas store lecture slides,
recordings and past papers, but offer no way to actually get help with
them. General-purpose AI assistants like ChatGPT can help, but they have
never seen your specific course, so they can produce confident, fluent
answers that are simply wrong for your syllabus.

AcademIQ closes that gap using **Retrieval-Augmented Generation (RAG)**:
every answer is generated only from real, retrieved chunks of the
student's own lecture material, and the system explicitly says so when it
doesn't know something rather than guessing.

## Features

- **Document viewer** — renders real lecture PDFs with page navigation,
  zoom, and a PDF/plain-text toggle. Select any passage of text to get an
  instant step-by-step solution, a simplified explanation, or a
  real-world example — grounded in that exact lecture.
- **Model paper solver** — pick a real past exam question and get a full,
  worked, step-by-step answer built from the actual course material.
- **AI tutor chat** — open-ended, course-specific Q&A that cites its
  sources and honestly declines to answer when a question falls outside
  the indexed material.
- **Multi-course support** — retrieval is scoped per course, so answers
  never bleed across subjects.
- Full authentication, dashboard, course navigation, and dark/light
  theming.

## How it works

```
Lecture PDFs
   │  pypdf text extraction
   ▼
Overlapping text chunks (400 chars, 80 char overlap)
   │  sentence-transformer embedding (all-MiniLM-L6-v2, 384-d)
   ▼
FAISS vector index
   │
   │  ← question embedded the same way, top-k nearest chunks retrieved
   ▼
Prompt = retrieved chunks + question + "answer only from this material"
   │
   │  Mistral 7B (4-bit quantized)
   ▼
Grounded answer, with source citation, returned to the app
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, React Router, react-pdf, Tailwind-style CSS |
| Backend | FastAPI (Python) |
| Retrieval | FAISS + `sentence-transformers` (`all-MiniLM-L6-v2`) |
| Generation | Mistral 7B Instruct, 4-bit NF4 quantization (`bitsandbytes`) |
| Infrastructure | Self-hosted on a university GPU cluster (NVIDIA L4) |

## Repository structure

```
academiq/
├── frontend/          React application (Vite)
│   └── src/
│       ├── pages/     Dashboard, CourseHome, DocumentViewer, PastPapers, AITutor...
│       └── components/
├── backend/
│   ├── rag_pipeline.py    Offline: builds the FAISS index from lecture PDFs
│   ├── api_mistral.py     Live FastAPI server: retrieval + Mistral 7B generation
│   └── requirements.txt
└── README.md
```

## Running it locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

The backend needs a CUDA-capable GPU with enough memory to run Mistral 7B
in 4-bit (an NVIDIA GPU with ≥16GB VRAM is recommended).

```bash
cd backend
pip install -r requirements.txt

# 1. Add your own course PDFs under course_content/<COURSE_CODE>/
# 2. Build the search index (run once, and again whenever content changes)
python rag_pipeline.py

# 3. Start the live server
python api_mistral.py
```

The frontend expects the backend at `http://localhost:8000` — set up an
SSH tunnel if the backend is running on a remote GPU machine.

> **Note:** Real lecture PDFs are intentionally excluded from this
> repository (see `.gitignore`) since course material is typically
> copyrighted and shouldn't be redistributed publicly. Add your own
> course content locally to `backend/course_content/` to run the system
> end to end.

## Project background

This project was built as part of an MSc Advanced Computer Science
dissertation (COMP702) at the University of Liverpool, evaluating whether
embedding course-specific AI assistance directly within a learning
platform produces greater perceived learning improvement than a
traditional LMS such as Canvas.

Generative AI tools, including Claude, were used during development to
help scaffold parts of this codebase, which were then reviewed, adapted
and integrated by the author.

## License

MIT — see [LICENSE](LICENSE).
