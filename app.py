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

TOOL_CATEGORIES = ["programming", "data_science", "databases", "cloud", "web", "analytics", "business"]
TOOL_KEYWORDS = sorted({
    skill
    for category in TOOL_CATEGORIES
    for skill in SKILL_DATABASE.get(category, [])
})

KEYWORD_STOPWORDS = {
    "and", "the", "for", "with", "from", "that", "this", "your", "will", "have",
    "has", "our", "you", "are", "who", "all", "any", "job", "role", "team",
    "work", "working", "using", "required", "requirements", "responsibilities",
    "responsibility", "experience", "years", "year", "plus", "ability", "skills",
    "knowledge", "strong", "good", "excellent", "preferred", "must", "should",
    "candidate", "position", "including", "across", "into", "their", "they",
    "them", "through", "about", "what", "when", "where", "how", "need", "etc"
}

EXPERIENCE_PATTERN = re.compile(r"\b(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b", re.IGNORECASE)


def _skill_in_text(skill: str, text: str) -> bool:
    """Boundary-aware skill matching."""
    if not skill:
        return False
    pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"
    return re.search(pattern, text, re.IGNORECASE) is not None


def detect_skills_in_text(text: str, use_fallback: bool = False) -> List[str]:
    """Detect skills in free text."""
    text = (text or "").lower()
    detected_skills = set()

    for skill, pattern in SKILL_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            detected_skills.add(skill)

    for skills in SKILL_DATABASE.values():
        for skill in skills:
            if _skill_in_text(skill, text):
                detected_skills.add(skill)

    if use_fallback and not detected_skills:
        detected_skills = {
            "python", "sql", "excel", "tableau", "power bi",
            "machine learning", "aws", "communication", "project management"
        }

    return sorted(detected_skills)


def extract_keywords(text: str, limit: int = 12) -> List[str]:
    """Extract high-signal keywords from text."""
    text = (text or "").lower()
    tokens = re.findall(r"[a-z][a-z0-9+#./-]{2,}", text)
    frequencies = {}

    for token in tokens:
        if token in KEYWORD_STOPWORDS:
            continue
        if token.isdigit():
            continue
        frequencies[token] = frequencies.get(token, 0) + 1

    ranked = sorted(frequencies.items(), key=lambda item: (-item[1], item[0]))
    return [token for token, _ in ranked[:limit]]


def extract_tools(text: str) -> List[str]:
    """Extract tools/technologies from text."""
    text = (text or "").lower()
    detected_tools = [tool for tool in TOOL_KEYWORDS if _skill_in_text(tool, text)]
    return sorted(set(detected_tools))


def extract_experience_level(text: str) -> Dict:
    """Infer experience requirement/level from text."""
    text = (text or "").lower()
    years_found = [int(value) for value in EXPERIENCE_PATTERN.findall(text)]
    years_required = max(years_found) if years_found else 0

    level = "Not specified"
    if "intern" in text or "entry level" in text or "fresher" in text:
        level = "Entry Level"
    elif any(token in text for token in ["senior", "lead", "principal", "staff"]):
        level = "Senior"
    elif any(token in text for token in ["junior", "associate"]):
        level = "Junior"
    elif years_required >= 8:
        level = "Senior"
    elif years_required >= 4:
        level = "Mid-Level"
    elif years_required >= 1:
        level = "Junior"

    return {
        "years_required": years_required,
        "experience_level": level
    }


def parse_job_description(jd_text: str) -> Dict:
    """Parse a JD into a structured profile."""
    required_skills = detect_required_skills(jd_text)
    experience = extract_experience_level(jd_text)
    return {
        "required_skills": required_skills,
        "tools": extract_tools(jd_text),
        "keywords": extract_keywords(jd_text),
        "experience_level": experience["experience_level"],
        "years_required": experience["years_required"]
    }


def parse_resume_profile(resume_text: str) -> Dict:
    """Parse a resume into a structured candidate profile."""
    resume_text = (resume_text or "").lower()
    experience = extract_experience_level(resume_text)
    project_mentions = len(re.findall(r"\bprojects?\b", resume_text, re.IGNORECASE))
    portfolio_signals = len(re.findall(r"\bgithub\b|\bportfolio\b|\bcase study\b", resume_text, re.IGNORECASE))

    return {
        "skills": detect_skills_in_text(resume_text, use_fallback=False),
        "tools": extract_tools(resume_text),
        "projects": {
            "project_mentions": project_mentions,
            "portfolio_signals": portfolio_signals
        },
        "experience": {
            "years": experience["years_required"],
            "level_signal": experience["experience_level"]
        }
    }


def get_verdict_label(fit_score: int) -> Dict:
    """Map fit score to final verdict."""
    if fit_score >= 75:
        return {"label": "Good Fit", "key": "good_fit"}
    if fit_score >= 50:
        return {"label": "Moderate", "key": "moderate"}
    return {"label": "Low Fit", "key": "low_fit"}


def build_candidate_recommendations(matched: List[str], missing: List[str], fit_score: int) -> List[str]:
    """Generate concise recommendations for recruiter output."""
    recommendations = []

    if fit_score >= 80:
        recommendations.append("Strong alignment with required technical stack.")
        recommendations.append("Proceed to technical screening and role-depth validation.")
    elif fit_score >= 60:
        recommendations.append("Good baseline alignment with the role expectations.")
        recommendations.append("Targeted upskilling can close remaining gaps quickly.")
    elif fit_score >= 45:
        recommendations.append("Moderate alignment; consider for pipeline roles with mentoring.")
        recommendations.append("Focused development plan recommended before final evaluation.")
    else:
        recommendations.append("Limited alignment for the current role requirements.")
        recommendations.append("Recommend significant upskilling before progressing.")

    if len(missing) <= 1 and fit_score >= 60:
        recommendations.append("Only one critical gap observed; improvement is likely achievable quickly.")
    elif len(missing) >= 3:
        recommendations.append("Multiple critical gaps identified; prioritize structured learning path.")

    return recommendations[:3]


def build_candidate_analysis_payload(resume_text: str, jd_text: str, jd_name: str, jd_source: str) -> Dict:
    """Build candidate-mode analysis payload for a single JD."""
    required_skills = detect_required_skills(jd_text)
    score_result = score_resume(resume_text, required_skills)
    all_detected_skills = list(set(score_result["matched"] + score_result["extras"]))

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

    suggestions = generate_improvement_suggestions(
        score_result["matched"],
        score_result["missing"],
        score_result["extras"]
    )

    alternative_roles = suggest_alternative_roles(all_detected_skills)

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

    return {
        "jd_name": jd_name,
        "jd_source": jd_source,
        "jd_profile": parse_job_description(jd_text),
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
            
            # Define namespace (WordprocessingML)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

            # Find all text elements. If namespace-prefixed lookup fails,
            # fall back to local-name matching for broader DOCX compatibility.
            text_elements = root.findall('.//w:t', ns)
            if not text_elements:
                text_elements = [elem for elem in root.iter() if elem.tag.endswith('}t') or elem.tag == 't']
            
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
    return detect_skills_in_text(jd_text, use_fallback=True)

def score_resume(resume_text: str, required_skills: List[str]) -> Dict:
    """Calculate resume score with enhanced matching"""
    resume_text = (resume_text or "").lower()
    
    # Exact matching
    matched = [skill for skill in required_skills if _skill_in_text(skill, resume_text)]
    
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
    all_skills = [skill for category in SKILL_DATABASE.values() for skill in category]
    extra_skills = []
    for skill in all_skills:
        if skill not in required_skills and _skill_in_text(skill, resume_text):
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
        # Gather all JD inputs as separate analyses (text + each uploaded JD file)
        jd_text = request.form.get("jd_text", "").strip().lower()
        jd_files = []
        for field_name in ["jd_file", "jd_files[]"]:
            for jd_file in request.files.getlist(field_name):
                if jd_file and jd_file.filename:
                    jd_files.append(jd_file)

        jd_documents = []
        if jd_text:
            jd_documents.append({
                "jd_name": "Pasted JD",
                "jd_source": "text",
                "text": jd_text
            })

        for index, jd_file in enumerate(jd_files, start=1):
            jd_documents.append({
                "jd_name": jd_file.filename or f"JD File {index}",
                "jd_source": "file",
                "text": extract_text(jd_file)
            })

        if not jd_documents:
            jd_documents.append({
                "jd_name": "Default Skill Profile",
                "jd_source": "default",
                "text": jd_text
            })

        # Process resumes once, then score against each JD independently
        resumes = request.files.getlist("resumes[]")
        if not resumes:
            return jsonify({"error": "No resumes uploaded!"}), 400

        extracted_resumes = []
        for resume in resumes:
            if resume and resume.filename:
                resume_text = extract_text(resume)
                extracted_resumes.append({
                    "name": resume.filename,
                    "text": resume_text,
                    "profile": parse_resume_profile(resume_text)
                })

        if not extracted_resumes:
            return jsonify({"error": "No valid resume files uploaded!"}), 400

        jd_analyses = []
        structured_results = {}
        for jd_doc in jd_documents:
            jd_profile = parse_job_description(jd_doc["text"])
            required_skills = jd_profile["required_skills"]
            results = []
            jd_candidate_map = {}

            for resume in extracted_resumes:
                score_result = score_resume(resume["text"], required_skills)
                verdict = get_verdict_label(score_result["fit"])

                recommendations = build_candidate_recommendations(
                    score_result["matched"],
                    score_result["missing"],
                    score_result["fit"]
                )

                candidate_result = {
                    "name": resume["name"],
                    "fit": score_result["fit"],
                    "match_score": score_result["fit"],
                    "matched": score_result["matched"],
                    "missing": score_result["missing"],
                    "extras": score_result["extras"],
                    "matched_count": score_result["matched_count"],
                    "missing_count": score_result["missing_count"],
                    "extra_count": score_result["extra_count"],
                    "recommendations": recommendations,
                    "verdict": verdict["label"],
                    "verdict_label": verdict["label"],
                    "verdict_key": verdict["key"],
                    "resume_profile": resume["profile"]
                }

                results.append(candidate_result)
                jd_candidate_map[resume["name"]] = {
                    "match_score": candidate_result["match_score"],
                    "matched_skills": candidate_result["matched"],
                    "missing_skills": candidate_result["missing"],
                    "recommendations": candidate_result["recommendations"],
                    "final_verdict": candidate_result["verdict"]
                }

            results = sorted(results, key=lambda x: x["fit"], reverse=True)

            total_candidates = len(results)
            avg_fit = round(sum(r["fit"] for r in results) / total_candidates) if results else 0

            jd_analyses.append({
                "jd_name": jd_doc["jd_name"],
                "jd_source": jd_doc["jd_source"],
                "jd_profile": jd_profile,
                "required_skills": required_skills,
                "results": results,
                "statistics": {
                    "total_candidates": total_candidates,
                    "average_fit": avg_fit,
                    "top_fit": results[0]["fit"] if results else 0,
                    "skills_detected": len(required_skills)
                }
            })
            structured_results[jd_doc["jd_name"]] = jd_candidate_map

        primary_analysis = jd_analyses[0]
        return jsonify({
            # Backward-compatible fields (first JD)
            "required_skills": primary_analysis["required_skills"],
            "results": primary_analysis["results"],
            "statistics": primary_analysis["statistics"],
            # Multi-JD payload
            "jd_count": len(jd_analyses),
            "multi_jd": len(jd_analyses) > 1,
            "jd_analyses": jd_analyses,
            "structured_results": structured_results,
            "viewer_prompt": "Select Job Description to view analysis results"
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
        jd_files = []
        for field_name in ["candidate_jd_file", "candidate_jd_files[]"]:
            for jd_file in request.files.getlist(field_name):
                if jd_file and jd_file.filename:
                    jd_files.append(jd_file)
        
        if not resume:
            return jsonify({"error": "No resume uploaded!"}), 400
        
        if not jd_text and not jd_files:
            return jsonify({"error": "At least one job description is required!"}), 400
        
        # Extract text
        resume_text = extract_text(resume)

        jd_documents = []
        if jd_text:
            jd_documents.append({
                "jd_name": "Pasted JD",
                "jd_source": "text",
                "text": jd_text
            })

        for index, jd_file in enumerate(jd_files, start=1):
            jd_documents.append({
                "jd_name": jd_file.filename or f"JD File {index}",
                "jd_source": "file",
                "text": extract_text(jd_file)
            })

        jd_analyses = []
        for jd_doc in jd_documents:
            jd_analyses.append(
                build_candidate_analysis_payload(
                    resume_text,
                    jd_doc["text"],
                    jd_doc["jd_name"],
                    jd_doc["jd_source"]
                )
            )

        primary_analysis = jd_analyses[0]
        response = {
            # Backward-compatible fields (first JD)
            "fit_score": primary_analysis["fit_score"],
            "skills": primary_analysis["skills"],
            "skill_gaps": primary_analysis["skill_gaps"],
            "suggestions": primary_analysis["suggestions"],
            "alternative_roles": primary_analysis["alternative_roles"],
            "learning_path": primary_analysis["learning_path"],
            "summary": primary_analysis["summary"],
            # Multi-JD payload
            "jd_count": len(jd_analyses),
            "multi_jd": len(jd_analyses) > 1,
            "candidate_jd_analyses": jd_analyses
        }

        if len(jd_analyses) > 1:
            response["viewer_prompt"] = "Select Job Description to view analysis results"

        return jsonify(response)
        
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
    print("Starting InterSyncIQ Server...")
    print("Version: 3.0.0")
    print("Modes: Recruiter & Candidate")
    print("Supported file types: PDF, DOCX, DOC, TXT")
    
    # Get port from environment variable (Railway sets this), default to 5000 for local
    port = int(os.environ.get("PORT", 5000))
    # Set debug mode based on environment
    debug_mode = os.environ.get("FLASK_ENV", "development") == "development"
    
    print(f"Server running on http://0.0.0.0:{port}")
    app.run(debug=debug_mode, host="0.0.0.0", port=port)
