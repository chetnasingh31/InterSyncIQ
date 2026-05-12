# InterSyncIQ

**Smart Resume Matching & Career Guidance**

AI-powered tool to help recruiters and candidates quickly analyze job descriptions and resumes, extract required skills, and surface the best matches and career guidance.

---

## 🚀 Project Overview

**InterSyncIQ** provides two primary modes:

### Recruiter Mode
- Paste or upload a job description (PDF / DOCX / TXT)
- Auto-extract required skills and role details
- Upload multiple resumes and analyze them against the JD
- Rank candidates and show matching skills + gaps
- Generate candidate comparison reports

### Candidate Mode
- Upload your resume
- Paste or upload a job description
- See how well you match with matching/missing skills highlighted
- Get targeted career guidance and improvement suggestions
- Understand skill gaps and career progression paths

---

## ✨ Key Features

- **Job Description Analysis** – Paste text or upload files (PDF, DOCX, TXT)
- **Automatic Skill Extraction** – Advanced pattern matching and categorized skill detection
- **Bulk Resume Upload** – Drag & drop interface for multiple candidate resumes
- **Intelligent Matching** – Calculates match scores and highlights matched/missing/extra skills
- **Career Guidance** – Role-based career path recommendations with skill requirements
- **Comprehensive Skill Database** – 60+ skills across programming, data science, cloud, web, analytics, and soft skills
- **Career Role Profiles** – Predefined roles (Data Scientist, Software Engineer, DevOps, Data Analyst, Product Manager)
- **Scalable** – Handles files up to 200MB total; 10MB per file (configurable)

---

## 📁 Project Structure

```
InterSyncIQ/
├── app.py                 # Flask backend - API endpoints and skill matching logic
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main UI (Recruiter + Candidate modes)
└── static/
    ├── style.css         # Styling and animations
    ├── script.js         # Frontend logic and mode switching
    └── chart.min.js      # Chart library for visualizations
```

---

## 🧩 Tech Stack

- **Backend:** Flask 2.3.3 (Python)
- **CORS:** Flask-CORS for cross-origin requests
- **File Handling:** PyPDF2 (PDF parsing), Werkzeug (file upload security)
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Styling:** Custom CSS with animations
- **Charts:** Chart.js for visualizations
- **Icons:** Font Awesome 6.4.0

---

## 📋 Supported File Types

| Format | Support |
|--------|---------|
| PDF    | ✅ Yes  |
| DOCX   | ✅ Yes  |
| TXT    | ✅ Yes  |

**Default file limits:**
- Individual file: 10MB
- Total upload: 200MB

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone & Navigate
```bash
git clone https://github.com/your-org/intersynciq.git
cd InterSyncIQ
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
```bash
python app.py
```

The application will start at: `http://localhost:5000`

---

## 🎯 Usage Guide

### Recruiter Mode

1. **Upload Job Description**
   - Paste JD text directly, or
   - Click "Upload Job Description" to upload PDF/DOCX/TXT file
   - System auto-extracts required skills and experience level

2. **Upload Resumes**
   - Use drag & drop or click to select multiple resume files
   - System processes all resumes in batch

3. **View Results**
   - See ranked list of candidates with match scores
   - For each candidate:
     - **Match Score** – Percentage of required skills matched
     - **Matched Skills** – Skills present in both JD and resume
     - **Missing Skills** – Skills required but not in resume
     - **Extra Skills** – Additional skills candidate has
   - Export results to CSV for further analysis

4. **Career Insights** (Optional)
   - View recommended roles based on extracted skills
   - See salary ranges and career growth potential for each role

### Candidate Mode

1. **Upload Resume**
   - Upload your resume (PDF, DOCX, or TXT)
   - System extracts your skills and experience level

2. **Provide Job Description**
   - Paste job description text, or
   - Upload a job description file

3. **View Your Match**
   - See overall match percentage
   - Review matched skills (strengths)
   - Identify missing skills (areas to improve)
   - Discover extra skills you possess

4. **Career Guidance**
   - Get personalized recommendations to improve match
   - Explore related career paths
   - See skill development suggestions

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Extract Skills from Text
```
POST /extract-skills
Content-Type: application/json

{
  "text": "5+ years Python experience, AWS, machine learning..."
}

Response:
{
  "skills": {
    "programming": ["python"],
    "cloud": ["aws"],
    "data_science": ["machine learning"]
  },
  "experience_years": 5
}
```

#### 2. Analyze Resumes Against Job Description
```
POST /analyze
Content-Type: multipart/form-data

Fields:
- jd_text (string): Job description text
- resumes (file[]): Multiple resume files

Response:
{
  "candidates": [
    {
      "filename": "john_doe.pdf",
      "match_score": 85.5,
      "matched_skills": ["python", "aws"],
      "missing_skills": ["kubernetes"],
      "extra_skills": ["java"]
    }
  ],
  "jd_skills": {
    "programming": ["python"],
    "cloud": ["aws", "kubernetes"]
  }
}
```

#### 3. Get Career Guidance
```
POST /career-guidance
Content-Type: application/json

{
  "skills": ["python", "machine learning", "sql"]
}

Response:
{
  "recommended_roles": [
    {
      "role": "data_scientist",
      "match_percentage": 90,
      "required_skills": ["python", "ml", "sql"],
      "salary_range": "$80,000 - $150,000",
      "growth": "High"
    }
  ]
}
```

---

## 💾 Configuration

### Adjustable Settings (in `app.py`)

```python
# Maximum content length (total upload size)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB

# Skill database
SKILL_DATABASE = {
    "programming": [...],
    "data_science": [...],
    # Add or modify skills here
}

# Career roles
CAREER_ROLES = {
    "data_scientist": {...},
    # Add or modify roles here
}
```

---

## 🛠️ Advanced Features

### Skill Extraction Engine
- **Pattern Matching:** Uses regex patterns for accurate skill detection
- **Boundary-Aware:** Ensures words like "python" in "cpython" aren't false positives
- **Categorization:** Automatically categorizes skills into 8 categories
- **Experience Detection:** Extracts years of experience from text

### Matching Algorithm
- Similarity scoring based on matched vs. required skills
- Considers missing and extra skills in ranking
- Weighted scoring for better candidate prioritization

### Career Role Database
Includes predefined roles with:
- Required skills
- Job descriptions
- Salary ranges
- Growth potential

---

## 📊 Power BI / Tableau Integration

After running recruiter analysis:

1. Export results as CSV from the "Analysis Results" section
2. Use **Power BI Desktop** or **Tableau** to import the CSV
3. Build dashboards with fields:
   - `candidate_name`, `candidate_rank`, `fit_score`
   - `skill_name`, `skill_status` (Matched/Missing/Extra/Required)
   - `is_matched`, `is_missing`, `is_extra`, `is_required`

**Example Visualizations:**
- Fit score distribution across candidates
- Missing skill heatmaps by candidate
- Top candidates vs. JD requirements
- Skill gap analysis

---

## 🚀 Deployment Guide (Render)

InterSyncIQ is deployed and managed using **Render**, a modern platform for hosting web applications with built-in free tier support.

### Prerequisites for Deployment

- GitHub account with repository access
- Render account (free tier available at [render.com](https://render.com))

### One-Click Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Click "Deploy existing repository" or paste GitHub repo URL
   - Select your `InterSyncIQ` repository
   - Render automatically detects Flask and configures deployment

3. **Render Automatic Configuration**
   - Reads `runtime.txt` → Uses Python 3.11.8
   - Reads `Procfile` → Runs `gunicorn app:app` in production
   - Installs `requirements.txt` dependencies
   - Automatically sets PORT environment variable
   - Creates free SSL/TLS certificate

4. **Access Your Live App**
   - Render assigns a unique domain (e.g., `intersynciq.onrender.com`)
   - Your app is live and accessible globally within 3-5 minutes
   - Auto-deploys on GitHub push (if connected)
   - View logs and manage deployment from Render dashboard

### Environment Variables

Render automatically handles:
- **PORT** – Dynamically assigned (Render sets this; `app.py` reads it)
- **PYTHON_VERSION** – Set to 3.11 (from `runtime.txt`)

You can add custom variables in Render dashboard:
- Settings → Environment → Add Environment Variable

### Local Testing Before Deployment

To test production setup locally:

```bash
# Install production dependencies (including gunicorn)
pip install -r requirements.txt

# Run with gunicorn (like Railway does)
gunicorn app:app --bind 0.0.0.0:8000

# Visit http://localhost:8000
```

### Monitoring & Management

**View Real-Time Logs:**
- Render Dashboard → Select your service → Logs tab
- Tail logs in real-time

**View Deployment Status:**
- Render Dashboard → Deployments tab → See status, start time, duration

**Scale or Modify:**
- Increase memory: Settings → Instance Type (paid tier)
- Change Python version: Update `runtime.txt` → Push to GitHub → Auto-redeploy
- Restart app: Settings → Restart instance

### Key Files for Deployment

| File | Purpose |
|------|---------|
| `Procfile` | Tells Render how to start the app (gunicorn) |
| `runtime.txt` | Specifies Python version (3.11.8) |
| `requirements.txt` | Lists all Python dependencies (includes gunicorn) |
| `app.py` | Main Flask application |

### Troubleshooting Deployment

**Build Fails:**
- Check Render logs for specific error
- Ensure all dependencies are in `requirements.txt`
- Verify `Procfile` format is correct (no extra spaces/newlines)

**App Crashes After Deploy:**
- Check logs in Render dashboard
- Ensure PORT env variable is used in `app.py`
- Verify all file paths are relative (not hardcoded absolute paths)

**Port Issues:**
- Render assigns PORT dynamically; `app.py` reads from `os.environ.get("PORT")`
- Don't hardcode port numbers in production code

**Free Tier Limitations:**
- Free services spin down after 15 minutes of inactivity
- To always keep running: upgrade to paid tier ($7/month)
- For active development: free tier is sufficient

### Rolling Back Deployment

If deployment has issues:
1. Go to Render dashboard
2. Deployments → Select previous working deployment
3. Click "Redeploy" button to go back to previous version

### Auto-Deploy from GitHub

**Enable Auto-Deploy:**
1. Connect GitHub repository in Render
2. Any push to `main` branch triggers automatic deployment
3. See deployment progress in Render dashboard
4. Rollback available if build fails

---

## �🚨 Troubleshooting

### Issue: "Port 5000 already in use"
**Solution:** Change the port in `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Use 5001 instead
```

### Issue: PDF files not parsing correctly
**Solution:** Ensure PyPDF2 is installed and up-to-date:
```bash
pip install --upgrade PyPDF2
```

### Issue: Large files timing out
**Solution:** Increase the timeout and max content length:
```python
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB
```

### Issue: CORS errors in browser console
**Solution:** Ensure `flask-cors` is installed:
```bash
pip install flask-cors
```

---

## 🔍 Supported Skills

**Programming Languages:** Python, Java, JavaScript, C++, C#, Ruby, PHP, Swift, Kotlin, Go, Rust, TypeScript

**Data Science:** Pandas, NumPy, Scikit-learn, TensorFlow, PyTorch, Keras, Spark, Hadoop

**Databases:** SQL, MySQL, PostgreSQL, MongoDB, Redis, Cassandra, Elasticsearch, Oracle

**Cloud & DevOps:** AWS, Azure, Google Cloud, Docker, Kubernetes, Terraform, Ansible, Jenkins

**Web Development:** HTML, CSS, React, Angular, Vue, Django, Flask, Node.js, Express, REST API, GraphQL

**Analytics:** Tableau, Power BI, Excel, SAS, SPSS, Matplotlib, Seaborn, Plotly

**Soft Skills:** Communication, Leadership, Teamwork, Problem Solving, Critical Thinking, Creativity

**Business:** Project Management, Agile, Scrum, Jira, Confluence, Product Management, Strategy

---

## 📝 License

This project is provided as-is for recruitment and career guidance purposes. Modify and distribute as needed.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Enhancement Ideas
- Add support for DOCX parsing
- Integrate with OpenAI for advanced NLP
- Add user authentication and job history tracking
- Build admin dashboard for skill database management
- Add resume parsing with ML-based layout detection
- Implement skill weight/importance scoring

---

## 📞 Support & Feedback

For issues, feature requests, or feedback:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

## 🎓 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [PyPDF2 Guide](https://github.com/py-pdf/PyPDF2)
- [JavaScript Resume Parsing](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Skill Extraction Techniques](https://github.com/topics/skill-extraction)
