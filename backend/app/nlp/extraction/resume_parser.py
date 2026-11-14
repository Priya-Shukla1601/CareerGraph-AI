import re
from pathlib import Path
from typing import Optional, List, Dict, Any

import pymupdf
from docx import Document as DocxDocument


# Comprehensive Skill dictionary that CareerGraph AI detects
SKILL_PATTERNS = {
    # Programming Languages
    "Python": r"\bpython\b",
    "Java": r"\bjava\b",
    "C++": r"\bc\+\+\b",
    "C": r"\bc\b",
    "C#": r"\bc#\b|\bc\s*sharp\b",
    "JavaScript": r"\bjavascript\b|\bjs\b",
    "TypeScript": r"\btypescript\b|\bts\b",
    "SQL": r"\bsql\b",
    "HTML": r"\bhtml\b|\bhtml5\b",
    "CSS": r"\bcss\b|\bcss3\b",
    "Go": r"\bgolang\b|\bgo\b",
    "Rust": r"\brust\b",
    "PHP": r"\bphp\b",
    "Ruby": r"\bruby\b",
    "R": r"\br\b",
    
    # Web & Frontend Frameworks
    "React": r"\breact(?:\.js)?\b",
    "Next.js": r"\bnext\.?js\b",
    "Node.js": r"\bnode\.?js\b",
    "Vue.js": r"\bvue(?:\.js)?\b",
    "Angular": r"\bangular\b",
    "Tailwind CSS": r"\btailwind(?:\s*css)?\b",
    
    # Backend Frameworks
    "Django": r"\bdjango\b",
    "FastAPI": r"\bfastapi\b",
    "Flask": r"\bflask\b",
    "Express": r"\bexpress(?:\.js)?\b",
    "Spring Boot": r"\bspring\s*boot\b",
    "REST APIs": r"\brest(?:ful)?\s*(?:api|apis)?\b",
    "GraphQL": r"\bgraphql\b",
    
    # Data Science, AI & Machine Learning
    "Machine Learning": r"\bmachine\s*learning\b|\bml\b",
    "Deep Learning": r"\bdeep\s*learning\b|\bdl\b",
    "NLP": r"\bnlp\b|natural\s*language\s*processing",
    "Data Science": r"\bdata\s*science\b",
    "Computer Vision": r"\bcomputer\s*vision\b|\bcv\b",
    "Transformers": r"\btransformers?\b",
    "BERT": r"\bbert\b",
    "LLMs": r"\bllms?\b|large\s*language\s*models?",
    "TensorFlow": r"\btensorflow\b",
    "PyTorch": r"\bpytorch\b",
    "Scikit-learn": r"\bscikit[-_\s]*learn\b|\bsklearn\b",
    "Pandas": r"\bpandas\b",
    "NumPy": r"\bnumpy\b",
    "Keras": r"\bkeras\b",
    "Hugging Face": r"\bhugging\s*face\b",
    "OpenCV": r"\bopencv\b",
    "Statistics": r"\bstatistics?\b|\bstatistical\s*analysis\b",
    
    # Cloud, DevOps & Tools
    "Git": r"\bgit\b|\bgithub\b|\bgitlab\b",
    "Docker": r"\bdocker\b",
    "Kubernetes": r"\bkubernetes\b|\bk8s\b",
    "AWS": r"\baws\b|amazon\s*web\s*services",
    "GCP": r"\bgcp\b|google\s*cloud\s*(?:platform)?",
    "Azure": r"\bazure\b",
    "CI/CD": r"\bci\s*/\s*cd\b|continuous\s*integration",
    "Linux": r"\blinux\b|\bunix\b",
    "MLflow": r"\bmlflow\b",
    "Terraform": r"\bterraform\b",
    
    # Databases
    "PostgreSQL": r"\bpostgresql\b|\bpostgres\b",
    "MongoDB": r"\bmongodb\b|\bmongo\b",
    "MySQL": r"\bmysql\b",
    "Redis": r"\bredis\b",
    "Firebase": r"\bfirebase\b",
    "Cybersecurity": r"\bcybersecurity\b|information\s*security",
}

EDUCATION_PATTERNS = [
    (r"\b(?:Ph\.?D|Doctor of Philosophy)\b", "Ph.D"),
    (r"\b(?:M\.?Tech|Master of Technology)\b", "M.Tech"),
    (r"\b(?:M\.?S\.?|Master of Science)\b", "M.S."),
    (r"\b(?:M\.?B\.?A\.?|Master of Business Administration)\b", "MBA"),
    (r"\b(?:M\.?C\.?A\.?|Master of Computer Applications)\b", "MCA"),
    (r"\b(?:B\.?Tech|Bachelor of Technology)\b", "B.Tech"),
    (r"\b(?:B\.?E\.?|Bachelor of Engineering)\b", "B.E."),
    (r"\b(?:B\.?S\.?|Bachelor of Science|B\.?Sc)\b", "B.S."),
    (r"\b(?:B\.?C\.?A\.?|Bachelor of Computer Applications)\b", "BCA"),
    (r"\b(?:Bachelor['’]?s\s*(?:degree)?|Undergraduate)\b", "Bachelor's Degree"),
    (r"\b(?:Master['’]?s\s*(?:degree)?|Postgraduate)\b", "Master's Degree"),
    (r"\b(?:Diploma)\b", "Diploma"),
]

LOCATION_PATTERNS = [
    r"\b(?:Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Pune|Chennai|Kolkata|Noida|Gurgaon|Gurugram|Ahmedabad)\b",
    r"\b(?:New York|San Francisco|Seattle|Austin|Boston|Chicago|Los Angeles|London|Toronto|Berlin|Singapore|Remote)\b",
    r"\b(?:India|USA|United States|UK|United Kingdom|Canada|Germany)\b",
]


def extract_text(file_path: str) -> str:
    """Extract text from PDF or DOCX files."""
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".pdf":
        with pymupdf.open(file_path) as pdf:
            return "\n".join(page.get_text() for page in pdf)

    elif extension == ".docx":
        document = DocxDocument(file_path)
        return "\n".join(
            paragraph.text for paragraph in document.paragraphs
        )

    else:
        raise ValueError("Only PDF and DOCX files are supported.")


def extract_email(text: str) -> Optional[str]:
    match = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text
    )
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    matches = re.findall(
        r"(?<!\w)(?:\+?\d{1,3}[-.\s]?)?"
        r"(?:\d[-.\s]?){9,12}\d(?!\w)",
        text
    )
    return matches[0].strip() if matches else None


def extract_skills(text: str) -> List[str]:
    found_skills = []
    for skill, pattern in SKILL_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)
    return sorted(list(set(found_skills)))


def extract_name(text: str, filename: str) -> str:
    """Extract candidate name from header of resume or fallback to filename."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        # Filter out email, phone, links, long sentences
        if "@" in line or "http" in line or "resume" in line.lower() or "curriculum" in line.lower():
            continue
        # Names are typically 2-4 words, alphabet letters only
        words = line.split()
        if 2 <= len(words) <= 4 and all(re.match(r"^[A-Za-z.'-]+$", w) for w in words):
            return line

    # Fallback to file name stem, cleaning out 'resume' or 'cv'
    stem = Path(filename).stem
    cleaned_stem = re.sub(r"(?i)[-_]?(?:resume|cv|biodata)[-_]?", " ", stem).strip()
    return cleaned_stem if cleaned_stem else stem


def extract_experience_years(text: str) -> float:
    """Estimate years of experience from resume text."""
    # Pattern 1: e.g. "3+ years of experience", "5 years experience", "4.5 yrs exp"
    matches = re.findall(
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)",
        text,
        re.IGNORECASE
    )
    if matches:
        try:
            exp_vals = [float(m) for m in matches if float(m) < 40]
            if exp_vals:
                return max(exp_vals)
        except ValueError:
            pass

    # Pattern 2: Look for year spans like 2018 - 2023 or 2020 - Present
    year_spans = re.findall(
        r"\b(20[0-2][0-9]|199[0-9])\s*[-–—to]+\s*(20[0-2][0-9]|present|current)\b",
        text,
        re.IGNORECASE
    )
    if year_spans:
        total_years = 0
        current_year = 2026
        for start, end in year_spans:
            try:
                s_yr = int(start)
                e_yr = current_year if end.lower() in ("present", "current") else int(end)
                if 0 <= (e_yr - s_yr) <= 30:
                    total_years += (e_yr - s_yr)
            except ValueError:
                continue
        if total_years > 0:
            return float(min(total_years, 30))

    return 0.0


def extract_education(text: str) -> List[Dict[str, Any]]:
    """Extract degrees and institutions from resume."""
    results = []
    found_degrees = set()

    for pattern, degree_label in EDUCATION_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match and degree_label not in found_degrees:
            found_degrees.add(degree_label)
            # Try to find nearby year
            context = text[max(0, match.start() - 50): min(len(text), match.end() + 100)]
            year_match = re.search(r"\b(20[0-2][0-9]|199[0-9])\b", context)
            year = int(year_match.group(1)) if year_match else 2022
            results.append({
                "degree": degree_label,
                "institution": "University / Institute",
                "year": year
            })

    return results


def extract_location(text: str) -> Optional[str]:
    """Find candidate location from text."""
    for pattern in LOCATION_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return None


def parse_resume(file_path: str) -> dict:
    """Extract structured information from a resume."""
    text = extract_text(file_path)
    filename = Path(file_path).name

    return {
        "filename": filename,
        "extracted_text": text,
        "name": extract_name(text, filename),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "location": extract_location(text),
        "skills": extract_skills(text),
        "experience": extract_experience_years(text),
        "education": extract_education(text),
    }
