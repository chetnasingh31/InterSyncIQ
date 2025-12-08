# AI Job Analyzer

Smart Resume Matching & Career Guidance  
AI-powered tool to help recruiters and candidates quickly analyze job descriptions and resumes, extract required skills, and surface the best matches and career guidance.

---

## 🚀 Project Overview

**AI Job Analyzer** provides two primary modes:

- **Recruiter Mode**
  - Paste or upload a job description (PDF / DOCX / TXT)
  - Auto-extract required skills and role details
  - Upload multiple resumes and analyze them against the JD
  - Rank candidates and show matching skills + gaps

- **Candidate Mode**
  - Upload your resume
  - See how well you match a job description
  - Get targeted suggestions to improve your resume and career guidance

---

## ✨ Key Features

- Job Description Analysis (paste or upload files)
- Automatic skill extraction from text and uploaded files (PDF, DOCX, TXT)
- Bulk resume upload with drag & drop
- Matching score and highlighted matched/missing skills
- Downloadable reports (per resume / per JD) — optional
- Configurable file size limit (default: 10MB per file)
- Modular: frontend + backend + AI integration (configurable provider)

---

## 📁 Supported File Types
- PDF
- DOCX
- TXT

_Max file size: 10MB per file (default, configurable)_

---

## 🧩 Tech Stack (suggested)
> These are suggestions — adjust to match your implementation.

- Frontend: React (Vite / Create React App) or Next.js
- Backend: Node.js + Express OR Python + FastAPI/Flask
- AI / NLP: OpenAI / Hugging Face / spaCy / custom model
- Storage: Local disk / S3 (for uploaded files)
- Optional: PostgreSQL / MongoDB (for user/jobs metadata)

---

## ⚙️ Installation (example for Node/React stack)

> Update commands to match your repo structure (e.g., `/frontend` and `/backend` folders).

1. Clone repository
```bash
git clone https://github.com/your-org/ai-job-analyzer.git
cd ai-job-analyzer
