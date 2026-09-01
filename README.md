# InterSyncIQ

**Smart Resume Matching, ATS Scoring & Career Guidance Platform**

InterSyncIQ is an AI-powered recruitment and career development platform that bridges the gap between recruiters and candidates. It provides intelligent job description parsing, bulk candidate resume screening, ATS compatibility scoring, multi-JD comparison, and personalized career roadmaps.

---

## 🚀 Project Overview

InterSyncIQ features two tailored operational modes:

### 👔 Recruiter Mode
- **Multi-JD Analysis**: Upload multiple job descriptions (PDF / DOCX / TXT) or paste text simultaneously and evaluate candidates across each JD with instant switching.
- **Bulk Resume Upload**: Drag & drop multiple candidate resumes for automated processing.
- **ATS Compatibility Scoring**: Evaluate resume structure, keyword optimization, formatting compliance, and quantifiable metrics.
- **Skill Coverage Insights**: View aggregate skill coverage across candidate pools to identify talent gaps.
- **Candidate Comparison Matrix**: Rank candidates by overall fit score, ATS rating, matched skills, and missing capabilities.
- **BI Dashboard Exports**: Export candidate evaluation data formatted specifically for **Power BI**, **Tableau**, **Excel (XLSX)**, **CSV**, and **JSON**.

### 🎓 Candidate Mode
- **Resume Fit Analysis**: Compare your resume against target job description(s) to measure alignment.
- **ATS Score & Optimization**: Receive an ATS Compatibility Score (0-100) with rating and top actionable feedback to beat ATS filters.
- **Skill Gap & Priority Roadmap**: Identify matched strengths vs. critical missing skills categorized by High, Medium, and Optional priorities.
- **Week-by-Week Learning Path**: Get a structured action plan with recommended courses, hands-on projects, and practice milestones.
- **Alternative Role Suggestions**: Discover alternative career roles based on detected skill overlap with current market salary ranges and growth projections.
- **Downloadable Action Plan**: Export your personalized career improvement roadmap.

---

## ✨ Key Features

- **ATS Scoring Engine**: 4-part automated scoring evaluating Structure (40%), Keywords (30%), Formatting (20%), and Achievements (10%).
- **Multi-Job Description Support**: Evaluate resumes against multiple JDs concurrently with independent scoring and UI tab/dropdown switching.
- **Zero-Dependency DOCX Parsing**: Native XML zip extraction for Word files (`.docx`) without requiring heavy external Python libraries.
- **Boundary-Aware Regex Skill Matching**: Precision skill detection preventing false positives (e.g., distinguishing "python" from "cpython").
- **Categorized Skill Database**: 80+ pre-configured skills across 8 domains (Programming, Data Science, Databases, Cloud & DevOps, Web Development, Analytics, Soft Skills, Business).
- **Interactive Visualizations & Comparison**: Clean candidate ranking cards, ATS indicator badges, and modal popups for deep-dive skill inspection.
- **Power BI & Tableau Export Ready**: Specialized flattened CSV schema export (`exportToBIDataset`) ready to plug into BI analytics dashboards.

---

## 📁 Project Structure

```
InterSyncIQ/
├── app.py                 # Core Flask backend server (API endpoints, skill matching, ATS engine)
├── requirements.txt       # Python dependencies (Flask, Flask-CORS, PyPDF2, Werkzeug)
├── README.md              # Project documentation
├── VERCEL_DEPLOYMENT.md   # Deployment guide for Vercel Serverless
├── Procfile               # Process configuration for Heroku/Render
├── runtime.txt            # Python version specification
├── vercel.json            # Vercel deployment & route rewriting rules
├── .vercelignore          # Files excluded from Vercel deployment
├── api/
│   └── index.py           # Vercel Serverless entrypoint (Flask application wrapper)
├── templates/
│   └── index.html         # Responsive Single Page Application (Recruiter + Candidate UI)
└── static/
    ├── style.css          # Glassmorphism UI styling, dark/light themes & animations
    └── script.js          # Client-side UI logic, drag & drop, multi-JD routing, export handlers
```

---

## 🧩 Tech Stack

- **Backend Framework:** Python 3.8+ with Flask 2.3.3 & Flask-CORS
- **Document Parsing:** PyPDF2 (PDF text extraction), Python `zipfile` & `xml.etree` (native DOCX parsing)
- **Frontend Architecture:** Vanilla HTML5, CSS3 (Modern Glassmorphism & Animations), ES6 JavaScript
- **Data Export & Visualizations:** SheetJS (`xlsx.full.min.js`), Chart.js
- **Typography & Icons:** Google Fonts (Poppins & Montserrat), Font Awesome 6.4.0
- **Deployment Environments:** Vercel Serverless, Railway, Heroku, Render

---

## 🤖 ATS Scoring Engine Breakdown

The Applicant Tracking System (ATS) compatibility engine evaluates resumes against job descriptions using a 100-point algorithm across four core pillars:

| Pillar | Weight | Evaluation Criteria |
|:---|:---:|:---|
| **Resume Structure** | 40% | Presence of essential sections: Contact Info (Email, Phone), Work Experience, Education, Skills section. |
| **Keyword Optimization** | 30% | Skill overlap and keyword match density against the target Job Description. |
| **Formatting Compliance** | 20% | ASCII cleanliness, parseable file structure, and action verb density (e.g., *Led*, *Developed*, *Achieved*). |
| **Achievement Clarity** | 10% | Detection of quantifiable metrics, percentages, and numerical accomplishment indicators. |

**ATS Ratings:**
- 🟢 **85 - 100%**: Excellent (Highly ATS compatible)
- 🔵 **70 - 84%**: Good (Minor optimizations recommended)
- 🟡 **50 - 69%**: Fair (Requires section & keyword improvements)
- 🔴 **0 - 49%**: Poor (Significant structural and keyword gaps)

---

## 📋 Supported File Types & Limits

| Format | Support | Parser Technique |
|:---|:---:|:---|
| **PDF** (`.pdf`) | ✅ Yes | PyPDF2 text extraction |
| **DOCX** (`.docx`, `.doc`) | ✅ Yes | Native XML Zip parsing & UTF-8 fallback |
| **TXT** (`.txt`) | ✅ Yes | Native text stream decoding |

**Upload Limits:**
- **Single File Limit:** 10 MB
- **Total Payload Limit:** 200 MB

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/intersynciq.git
cd InterSyncIQ
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run Application locally
```bash
python app.py
```

Access the application in your browser at `http://localhost:5000`.

---

## 🎯 Usage Guide

### Recruiter Mode

1. **Provide Job Description(s)**
   - Paste job description text into the input box, and/or
   - Upload one or multiple JD files (`.pdf`, `.docx`, `.txt`).
2. **Upload Resumes**
   - Drag & drop candidate resumes into the upload area or browse files.
3. **Run Screening**
   - Click **Analyze Resumes**.
4. **Review Results**
   - If multiple JDs were supplied, use the dropdown to switch between JD evaluation views.
   - Inspect Overall Fit Scores, ATS Scores & Ratings, Skill Coverage Insights, and Top Candidates.
   - Click any candidate card for modal detail breakdowns and ATS improvement suggestions.
5. **Export Data**
   - Click **Export Results** to choose between **BI Dataset (Power BI / Tableau)**, **CSV**, **Excel (XLSX)**, or **JSON**.

### Candidate Mode

1. **Switch Mode**
   - Toggle to **Candidate Mode** using the top navigation bar.
2. **Target Role & Resume**
   - Paste target job description text or attach JD file(s).
   - Upload your resume (`.pdf`, `.docx`, or `.txt`).
3. **Analyze Fit**
   - Click **Analyze My Fit**.
4. **Review Career Guidance**
   - View your Overall Match % and ATS Rating.
   - Inspect matched strengths vs. missing skill gaps.
   - Review high/medium/optional action items and week-by-week learning roadmap.
   - Explore alternative career pathways matching your current skill set.
5. **Export Roadmap**
   - Click **Download Action Plan** to save your career roadmap.

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000
```

### 1. Multi-Resume & JD Screening
- **Endpoint:** `POST /analyze`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `jd_text` (optional string): Pasted job description text.
  - `jd_file` / `jd_files[]` (optional files): One or multiple JD files.
  - `resumes[]` (required files): Array of candidate resume files.
- **Response:** JSON payload containing multi-JD analyses, required skills, fit scores, ATS scores/ratings, skill coverage, candidate rankings, and recommendations.

### 2. Candidate Role Fit Analysis
- **Endpoint:** `POST /analyze-candidate`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `candidate_resume` (required file): Candidate resume file.
  - `jd_text` (optional string): Target job description text.
  - `candidate_jd_file` / `candidate_jd_files[]` (optional files): Target JD files.
- **Response:** Detailed candidate breakdown including match score, ATS score/rating, skill gaps, learning path, alternative role suggestions, and action plan.

### 3. Career Guidance
- **Endpoint:** `POST /career-guidance`
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "skills": ["python", "sql", "aws", "machine learning"]
  }
  ```
- **Response:** Skill categorization and career insight recommendations.

### 4. Health Check
- **Endpoint:** `GET /health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "version": "3.0.0",
    "modes": ["recruiter", "candidate"]
  }
  ```

### 5. Test File Upload
- **Endpoint:** `POST /test-upload`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (single file)
- **Response:** Parsed text length and character preview for verification.

---

## 📊 Power BI & Tableau Integration

InterSyncIQ generates a flattened analytical dataset tailored for BI tools like **Power BI Desktop** and **Tableau**:

1. Run candidate screening in Recruiter Mode.
2. Click **Export Results** → Select **BI Dataset (Recommended)**.
3. Import the generated CSV into Power BI or Tableau.

### BI Dataset Schema

| Field Name | Type | Description |
|:---|:---:|:---|
| `analysis_date` | String (ISO) | Timestamp of analysis run |
| `jd_index` | Integer | Sequential JD identifier |
| `jd_name` | String | Name/filename of the Job Description |
| `candidate_name` | String | Filename of candidate resume |
| `candidate_rank` | Integer | Rank position within the JD pool |
| `fit_score` | Integer | Overall job match percentage (0-100) |
| `ats_score` | Integer | ATS compatibility score (0-100) |
| `ats_rating` | String | Excellent / Good / Fair / Poor |
| `matched_count` | Integer | Count of matched skills |
| `missing_count` | Integer | Count of missing required skills |
| `extra_count` | Integer | Count of extra candidate skills |
| `required_skills_count` | Integer | Total skills required by JD |
| `skill_name` | String | Name of skill evaluated |
| `skill_status` | String | Matched / Missing / Extra / Required / Related |
| `is_required` | Binary (0/1) | Flag indicating if skill is required by JD |
| `is_matched` | Binary (0/1) | Flag indicating if candidate matches skill |
| `is_missing` | Binary (0/1) | Flag indicating if candidate is missing skill |
| `is_extra` | Binary (0/1) | Flag indicating candidate has extra skill |

---

## 🚀 Deployment Guide (Vercel Serverless)

InterSyncIQ is configured for serverless deployment on **Vercel** with zero backend infrastructure configuration required.

### Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to preview / production
vercel
```

### Deploy via GitHub Integration

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```
2. Open [Vercel Dashboard](https://vercel.com) and click **Import Project**.
3. Select your repository. Vercel automatically detects `vercel.json` and `api/index.py`.
4. Click **Deploy**.

---

## 🔍 Supported Skill Taxonomy

- **Programming:** Python, Java, JavaScript, TypeScript, C++, C#, Ruby, PHP, Swift, Kotlin, Go, Rust
- **Data Science & ML:** Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch, Keras, Spark, Hadoop, Hive, Pig
- **Databases:** SQL, MySQL, PostgreSQL, MongoDB, Redis, Cassandra, Elasticsearch, Oracle, SQLite
- **Cloud & DevOps:** AWS, Azure, Google Cloud, Docker, Kubernetes, Terraform, Ansible, Jenkins, CI/CD
- **Web Development:** HTML, CSS, React, Angular, Vue, Django, Flask, Node.js, Express, REST API, GraphQL
- **Analytics:** Tableau, Power BI, Excel, SAS, SPSS, Matplotlib, Seaborn, Plotly
- **Soft Skills:** Communication, Leadership, Teamwork, Problem Solving, Critical Thinking, Creativity, Adaptability
- **Business & Agile:** Project Management, Agile, Scrum, Jira, Confluence, Product Management, Strategy

---

## 📝 License & Contributions

This project is provided open-source under the MIT License for talent acquisition and career planning. Contributions, issues, and feature pull requests are welcome!
