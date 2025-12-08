from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import tempfile
import json
from werkzeug.utils import secure_filename
import PyPDF2
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Dict, Set
import traceback
import io

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024

# Enhanced skill database
SKILL_DATABASE = {
    "programming": ["python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "typescript"],
    "data_science": ["pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "spark", "hadoop", "hive", "pig"],
    "databases": ["sql", "mysql", "postgresql", "mongodb", "redis", "cassandra", "elasticsearch", "oracle", "sqlite"],
    "cloud": ["aws", "azure", "google cloud", "docker", "kubernetes", "terraform", "ansible", "jenkins", "ci/cd"],
    "web": ["html", "css", "react", "angular", "vue", "django", "flask", "node.js", "express", "rest api", "graphql"],
    "analytics": ["tableau", "power bi", "excel", "sas", "spss", "matplotlib", "seaborn", "plotly"],
    "soft_skills": ["communication", "leadership", "teamwork", "problem solving", "critical thinking", "creativity", "adaptability"],
    "business": ["project management", "agile", "scrum", "jira", "confluence", "product management", "strategy"]
}

# Advanced skill detection patterns
SKILL_PATTERNS = {
    "python": r"\bpython\b|\bpy\b",
    "machine learning": r"\bmachine learning\b|\bml\b",
    "deep learning": r"\bdeep learning\b|\bdl\b|\bneural networks?\b",
    "data analysis": r"\bdata analysis\b|\banalytics\b",
    "aws": r"\baws\b|\bamazon web services\b",
    "sql": r"\bsql\b|\bstructured query language\b",
    "excel": r"\bexcel\b|\bmicrosoft excel\b",
    "power bi": r"\bpower bi\b|\bpowerbi\b",
}

# Career role database
CAREER_ROLES = {
    "data_scientist": {
        "required_skills": ["python", "machine learning", "sql", "statistics", "pandas"],
        "description": "Analyze complex data to extract insights",
        "salary_range": "$80,000 - $150,000",
        "growth": "High"
    },
    "software_engineer": {
        "required_skills": ["python", "java", "javascript", "c++", "git", "sql"],
        "description": "Develop and maintain software applications",
        "salary_range": "$70,000 - $160,000",
        "growth": "Very High"
    },
    "devops_engineer": {
        "required_skills": ["aws", "docker", "kubernetes", "jenkins", "linux", "python"],
        "description": "Bridge between development and IT operations",
        "salary_range": "$85,000 - $170,000",
        "growth": "High"
    },
    "data_analyst": {
        "required_skills": ["sql", "excel", "tableau", "python", "statistics"],
        "description": "Interpret data to help businesses make decisions",
        "salary_range": "$60,000 - $120,000",
        "growth": "Medium"
    },
    "product_manager": {
        "required_skills": ["agile", "communication", "strategy", "market research", "jira"],
        "description": "Lead product development from concept to launch",
        "salary_range": "$90,000 - $200,000",
        "growth": "High"
    }
}

def extract_from_pdf(path: str) -> str:
    """Extract text from PDF files"""
    text = ""
    try:
        reader = PyPDF2.PdfReader(path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + " "
    except Exception as e:
        print(f"PDF extraction error: {e}")
    return text.lower()

def extract_from_docx_manual(path: str) -> str:
    """Extract text from DOCX files without python-docx"""
    text = ""
    try:
        # DOCX is a ZIP file containing XML
        with zipfile.ZipFile(path, 'r') as docx:
            # Read the main document XML
            document_xml = docx.read('word/document.xml')
            
            # Parse XML
            root = ET.fromstring(document_xml)
            
            # Define namespace
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Find all text elements
            text_elements = root.findall('.//w:t', ns)
            
            # Extract text
            for elem in text_elements:
                if elem.text:
                    text += elem.text + " "
                    
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        # Fallback: try to read as plain text if it's actually a .doc file
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read().lower()
        except:
            pass
    
    return text.lower()

def extract_text(file_storage) -> str:
    """Extract text from uploaded file"""
    if not file_storage or not file_storage.filename:
        return ""
    
    filename = secure_filename(file_storage.filename)
    file_extension = filename.split('.')[-1].lower()
    
    # Save file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_extension}') as tmp:
        tmp.write(file_storage.read())
        tmp.flush()
        temp_path = tmp.name
    
    text = ""
    try:
        if file_extension == 'pdf':
            text = extract_from_pdf(temp_path)
        elif file_extension in ['docx', 'doc']:
            text = extract_from_docx_manual(temp_path)
        elif file_extension == 'txt':
            # Reset file pointer and read as text
            file_storage.seek(0)
            text = file_storage.read().decode('utf-8', errors='ignore').lower()
        else:
            # Try PDF first, then text
            try:
                text = extract_from_pdf(temp_path)
            except:
                # Try reading as text file
                with open(temp_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read().lower()
    except Exception as e:
        print(f"Text extraction error: {e}")
        # Last resort: try to read as binary and decode
        try:
            with open(temp_path, 'rb') as f:
                content = f.read()
                # Try multiple encodings
                for encoding in ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']:
                    try:
                        text = content.decode(encoding, errors='ignore').lower()
                        break
                    except:
                        continue
        except:
            text = ""
    finally:
        try:
            os.remove(temp_path)
        except:
            pass
    
    return text

def detect_required_skills(jd_text: str) -> List[str]:
    """Enhanced skill detection from job description"""
    jd_text = jd_text.lower()
    detected_skills = set()
    
    # Pattern matching
    for skill, pattern in SKILL_PATTERNS.items():
        if re.search(pattern, jd_text, re.IGNORECASE):
            detected_skills.add(skill)
    
    # Category matching
    for category, skills in SKILL_DATABASE.items():
        for skill in skills:
            if skill in jd_text:
                detected_skills.add(skill)
    
    # Fallback to default skills if none detected
    if not detected_skills:
        detected_skills = set([
            "python", "sql", "excel", "tableau", "power bi",
            "machine learning", "aws", "communication", "project management"
        ])
    
    return sorted(list(detected_skills))

def score_resume(resume_text: str, required_skills: List[str]) -> Dict:
    """Calculate resume score with enhanced matching"""
    resume_text = resume_text.lower()
    
    # Exact matching
    matched = [skill for skill in required_skills if skill in resume_text]
    
    # Pattern matching for variations
    for skill in required_skills:
        if skill not in matched:
            pattern = SKILL_PATTERNS.get(skill, None)
            if pattern and re.search(pattern, resume_text, re.IGNORECASE):
                matched.append(skill)
    
    # Remove duplicates
    matched = list(set(matched))
    
    # Find missing skills
    missing = [skill for skill in required_skills if skill not in matched]
    
    # Find extra skills (not in required but in resume)
    all_skills = []
    for category in SKILL_DATABASE.values():
        all_skills.extend(category)
    
    extra_skills = []
    for skill in all_skills:
        if skill not in required_skills and skill in resume_text:
            extra_skills.append(skill)
    
    # Calculate fit percentage with weighted scoring
    if required_skills:
        base_fit = (len(matched) / len(required_skills)) * 100
        
        # Bonus for extra skills
        extra_bonus = min(len(extra_skills) * 2, 10)  # Max 10% bonus
        
        # Penalty for missing critical skills
        critical_skills = ["python", "sql", "communication", "problem solving"]
        missing_critical = len([s for s in missing if s in critical_skills])
        critical_penalty = missing_critical * 5  # 5% penalty per missing critical skill
        
        fit = max(0, min(100, base_fit + extra_bonus - critical_penalty))
    else:
        fit = 0
    
    return {
        "fit": round(fit),
        "matched": sorted(matched),
        "missing": sorted(missing),
        "extras": sorted(extra_skills[:10]),  # Limit extra skills
        "matched_count": len(matched),
        "missing_count": len(missing),
        "extra_count": len(extra_skills)
    }

def find_related_skills(skill):
    """Find related skills for learning path"""
    related_map = {
        "python": ["pandas", "numpy", "django", "flask", "automation"],
        "sql": ["database design", "query optimization", "data modeling"],
        "aws": ["cloud architecture", "serverless", "containerization"],
        "react": ["javascript", "redux", "frontend architecture"],
        "machine learning": ["deep learning", "data preprocessing", "model deployment"],
        "communication": ["presentation", "technical writing", "stakeholder management"]
    }
    return related_map.get(skill.lower(), ["online courses", "hands-on projects"])

def generate_improvement_suggestions(matched, missing, extras):
    """Generate personalized improvement suggestions"""
    suggestions = []
    
    if matched:
        suggestions.append({
            "type": "highlight",
            "title": "Highlight Your Strengths",
            "content": f"Emphasize these skills in your resume: {', '.join(matched[:3])}",
            "priority": "high"
        })
    
    if missing:
        suggestions.append({
            "type": "learn",
            "title": "Skill Development Priority",
            "content": f"Focus on learning: {', '.join(missing[:2])}",
            "priority": "high",
            "resources": [
                "Online courses (Coursera, Udemy)",
                "Practice projects on GitHub",
                "Industry certifications"
            ]
        })
    
    if extras:
        suggestions.append({
            "type": "leverage",
            "title": "Leverage Unique Skills",
            "content": f"Your unique skills ({', '.join(extras[:3])}) can differentiate you",
            "priority": "medium"
        })
    
    return suggestions

def suggest_alternative_roles(detected_skills):
    """Suggest alternative career roles based on skills"""
    suggestions = []
    
    for role, info in CAREER_ROLES.items():
        role_skills = info["required_skills"]
        matched_skills = [skill for skill in role_skills if skill in detected_skills]
        match_percentage = len(matched_skills) / len(role_skills) * 100
        
        if match_percentage >= 50:
            suggestions.append({
                "role": role.replace("_", " ").title(),
                "match": round(match_percentage),
                "description": info["description"],
                "salary_range": info["salary_range"],
                "growth": info["growth"],
                "matched_skills": matched_skills,
                "missing_skills": [s for s in role_skills if s not in matched_skills]
            })
    
    return sorted(suggestions, key=lambda x: x["match"], reverse=True)[:3]

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        # Extract job description
        jd_text = request.form.get("jd_text", "").strip().lower()
        jd_file = request.files.get("jd_file")
        
        if jd_file and jd_file.filename:
            jd_text += " " + extract_text(jd_file)
        
        # Detect required skills
        required_skills = detect_required_skills(jd_text)
        
        # Process resumes
        resumes = request.files.getlist("resumes[]")
        if not resumes:
            return jsonify({"error": "No resumes uploaded!"}), 400
        
        results = []
        for resume in resumes:
            if resume.filename:
                resume_text = extract_text(resume)
                score_result = score_resume(resume_text, required_skills)
                
                results.append({
                    "name": resume.filename,
                    "fit": score_result["fit"],
                    "matched": score_result["matched"],
                    "missing": score_result["missing"],
                    "extras": score_result["extras"],
                    "matched_count": score_result["matched_count"],
                    "missing_count": score_result["missing_count"],
                    "extra_count": score_result["extra_count"]
                })
        
        # Sort by fit score
        results = sorted(results, key=lambda x: x["fit"], reverse=True)
        
        # Calculate statistics
        total_candidates = len(results)
        avg_fit = round(sum(r["fit"] for r in results) / total_candidates) if results else 0
        
        return jsonify({
            "required_skills": required_skills,
            "results": results,
            "statistics": {
                "total_candidates": total_candidates,
                "average_fit": avg_fit,
                "top_fit": results[0]["fit"] if results else 0,
                "skills_detected": len(required_skills)
            }
        })
        
    except Exception as e:
        print(f"Error in analyze endpoint: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-candidate", methods=["POST"])
def analyze_candidate():
    """Enhanced candidate analysis endpoint"""
    try:
        resume = request.files.get("candidate_resume")
        jd_text = request.form.get("jd_text", "").strip().lower()
        
        if not resume:
            return jsonify({"error": "No resume uploaded!"}), 400
        
        if not jd_text:
            return jsonify({"error": "Job description is required!"}), 400
        
        # Extract text
        resume_text = extract_text(resume)
        
        # Detect required skills from JD
        required_skills = detect_required_skills(jd_text)
        
        # Score resume
        score_result = score_resume(resume_text, required_skills)
        
        # Get all detected skills
        all_detected_skills = list(set(score_result["matched"] + score_result["extras"]))
        
        # Generate skill gaps analysis
        skill_gaps = []
        for missing_skill in score_result["missing"]:
            related = find_related_skills(missing_skill)
            skill_gaps.append({
                "skill": missing_skill,
                "related_skills": related,
                "priority": "high" if missing_skill in ["python", "sql", "communication"] else "medium",
                "learning_resources": [
                    f"Online course: {missing_skill.title()} Fundamentals",
                    "Hands-on project tutorial",
                    "Industry certification preparation"
                ]
            })
        
        # Generate improvement suggestions
        suggestions = generate_improvement_suggestions(
            score_result["matched"],
            score_result["missing"],
            score_result["extras"]
        )
        
        # Suggest alternative roles
        alternative_roles = suggest_alternative_roles(all_detected_skills)
        
        # Generate learning path
        learning_path = []
        for i, missing in enumerate(score_result["missing"][:3], 1):
            learning_path.append({
                "week": i,
                "focus": missing,
                "actions": [
                    "Complete online course",
                    "Build small project",
                    "Practice with exercises",
                    "Get feedback from community"
                ],
                "resources": [
                    f"Course: {missing.title()} Masterclass",
                    "GitHub project ideas",
                    "Practice platform exercises"
                ]
            })
        
        return jsonify({
            "fit_score": score_result["fit"],
            "skills": {
                "matched": score_result["matched"],
                "missing": score_result["missing"],
                "extras": score_result["extras"],
                "total_detected": len(all_detected_skills)
            },
            "skill_gaps": skill_gaps,
            "suggestions": suggestions,
            "alternative_roles": alternative_roles,
            "learning_path": learning_path,
            "summary": {
                "match_percentage": score_result["fit"],
                "strengths": len(score_result["matched"]),
                "improvement_areas": len(score_result["missing"]),
                "unique_assets": len(score_result["extras"])
            }
        })
        
    except Exception as e:
        print(f"Candidate analysis error: {e}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/career-guidance", methods=["POST"])
def career_guidance():
    """Provide career guidance based on skills"""
    try:
        data = request.json
        skills = data.get("skills", [])
        
        if not skills:
            return jsonify({"error": "No skills provided"}), 400
        
        # Analyze skill combinations
        skill_categories = {
            "technical": [],
            "analytical": [],
            "soft": [],
            "management": []
        }
        
        # Categorize skills
        for skill in skills:
            skill_lower = skill.lower()
            if skill_lower in ["python", "java", "javascript", "c++", "sql", "aws"]:
                skill_categories["technical"].append(skill)
            elif skill_lower in ["excel", "tableau", "statistics", "data analysis"]:
                skill_categories["analytical"].append(skill)
            elif skill_lower in ["communication", "teamwork", "leadership"]:
                skill_categories["soft"].append(skill)
            elif skill_lower in ["project management", "agile", "scrum"]:
                skill_categories["management"].append(skill)
        
        # Generate career insights
        career_insights = []
        
        if len(skill_categories["technical"]) >= 3:
            career_insights.append({
                "role": "Technical Specialist",
                "match": "High",
                "next_steps": ["Learn advanced frameworks", "Build portfolio", "Get certification"],
                "potential_roles": ["Software Engineer", "DevOps Engineer", "Data Engineer"]
            })
        
        if len(skill_categories["analytical"]) >= 2:
            career_insights.append({
                "role": "Analyst",
                "match": "Medium",
                "next_steps": ["Learn data visualization", "Practice SQL queries", "Study statistics"],
                "potential_roles": ["Data Analyst", "Business Analyst", "Marketing Analyst"]
            })
        
        if len(skill_categories["soft"]) >= 2 and len(skill_categories["management"]) >= 1:
            career_insights.append({
                "role": "Management",
                "match": "Medium",
                "next_steps": ["Learn project management", "Develop leadership skills", "Study business strategy"],
                "potential_roles": ["Project Manager", "Product Manager", "Team Lead"]
            })
        
        return jsonify({
            "skill_categories": skill_categories,
            "career_insights": career_insights,
            "recommendations": {
                "develop": list(set(skills) - set(sum(skill_categories.values(), [])))[:3],
                "leverage": max(skill_categories.items(), key=lambda x: len(x[1]))[0] if skill_categories else "technical",
                "explore": ["Cross-functional roles", "Emerging technologies", "Industry-specific applications"]
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "version": "3.0.0", "modes": ["recruiter", "candidate"]})

@app.route("/test-upload", methods=["POST"])
def test_upload():
    """Test endpoint to check file upload functionality"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Extract text
        text = extract_text(file)
        
        return jsonify({
            "filename": file.filename,
            "text_length": len(text),
            "preview": text[:500] + "..." if len(text) > 500 else text,
            "success": True
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting AI Job Analyzer Server...")
    print("Version: 3.0.0")
    print("Modes: Recruiter & Candidate")
    print("Supported file types: PDF, DOCX, DOC, TXT")
    print("Server running on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)