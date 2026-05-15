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

## 🚀 Deployment Guide (Vercel)

InterSyncIQ is live on **Vercel** at: **https://inter-sync-iq.vercel.app**

Vercel is a modern serverless platform optimized for Python applications.

### Access the Live Application

🌐 **Live URL:** [https://inter-sync-iq.vercel.app](https://inter-sync-iq.vercel.app)

### Prerequisites for Deployment

- GitHub account with repository access
- Vercel account (free tier available at [vercel.com](https://vercel.com))

### Quick Deployment Options

#### Option 1: Deploy via Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel
```

#### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"
   - Vercel auto-detects Python and deploys automatically

3. **Access Your Live App**
   - App is live globally within 2-3 minutes
   - Auto-deploys on every GitHub push
   - Live at: **https://inter-sync-iq.vercel.app**

### How It Works

**Vercel Configuration:**
- `vercel.json` – Defines serverless function, rewrites, and environment
- `api/index.py` – Flask app runs as a serverless function
- `static/` & `templates/` – Served as static assets
- Automatic scaling and 99.99% uptime
- Free SSL/TLS included

### Local Testing Before Deployment

To test locally before deployment:

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally (like app.py)
python app.py

# Visit http://localhost:5000
```

### Monitoring & Management

**View Logs:**
- Vercel Dashboard → Select project → Deployments tab
- Click deployment → Logs section

**View Analytics:**
- Vercel Dashboard → Analytics tab
- Monitor bandwidth, requests, performance

**Environment Variables:**
- Project Settings → Environment Variables
- Add custom environment variables as needed

**Custom Domain:**
- Project Settings → Domains
- Add your custom domain (requires DNS configuration)

### Key Files for Deployment

| File | Purpose |
|------|---------|
| `api/index.py` | Serverless Flask function (Vercel entry point) |
| `vercel.json` | Vercel configuration (routing, env, memory) |
| `requirements.txt` | Python dependencies |
| `.vercelignore` | Files to exclude from deployment |
| `static/` | CSS, JavaScript, assets |
| `templates/` | HTML templates |

### Troubleshooting Deployment

**500 Errors on API Calls:**
- Check Vercel Logs for error messages
- Verify all dependencies are in `requirements.txt`

**Static Files Not Loading:**
- Ensure `static/` and `templates/` folders exist
- Check `vercel.json` configuration

**Build Failure:**
- Make sure `requirements.txt` has all dependencies
- Check Python version compatibility (3.8+)

### Rolling Back Deployment

If deployment has issues:
1. Go to Vercel dashboard
2. Deployments tab → Select previous working deployment
3. Click "Redeploy" to go back to previous version

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
