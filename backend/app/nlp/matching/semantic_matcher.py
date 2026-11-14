from typing import Dict, Any, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.nlp.preprocessing.cleaner import clean_text


def compute_semantic_similarity(resume_text: str, job_text: str) -> float:
    """
    Calculate semantic similarity between resume text and job description
    using TF-IDF n-gram vectorization and cosine similarity.
    Returns score as a percentage between 0 and 100.
    """
    cleaned_resume = clean_text(resume_text)
    cleaned_job = clean_text(job_text)

    if not cleaned_resume or not cleaned_job:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_job])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Scale to 0 - 100 with a slight normalization curve for text matches
        score = float(similarity) * 100.0
        # Realistic threshold scaling: typical document cosine is 0.1 - 0.7
        normalized = min(100.0, max(0.0, score * 1.5))
        return round(normalized, 1)
    except Exception:
        # Fallback keyword overlap
        words_resume = set(cleaned_resume.split())
        words_job = set(cleaned_job.split())
        if not words_job:
            return 0.0
        overlap = len(words_resume.intersection(words_job)) / len(words_job)
        return round(min(100.0, overlap * 100.0), 1)


def evaluate_candidate_match(
    candidate: Dict[str, Any],
    job: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Perform multi-dimensional matching of a candidate against a job description.
    
    Dimensions:
    1. Skill Match (35% weight)
    2. Semantic Similarity (40% weight)
    3. Experience Match (15% weight)
    4. Education Match (10% weight)
    """
    candidate_skills = [s.strip().lower() for s in (candidate.get("skills") or [])]
    required_skills = [s.strip() for s in (job.get("required_skills") or [])]
    preferred_skills = [s.strip() for s in (job.get("preferred_skills") or [])]

    # --- 1. Skill Match ---
    matched_required = []
    missing_required = []

    for req in required_skills:
        if req.lower() in candidate_skills:
            matched_required.append(req)
        else:
            missing_required.append(req)

    matched_preferred = [
        pref for pref in preferred_skills
        if pref.lower() in candidate_skills
    ]

    total_req = max(1, len(required_skills))
    req_ratio = len(matched_required) / total_req
    pref_bonus = (len(matched_preferred) / max(1, len(preferred_skills))) * 0.15 if preferred_skills else 0.0

    skill_score = min(100.0, (req_ratio * 0.85 + pref_bonus) * 100.0) if required_skills else 80.0
    skill_score = round(skill_score, 1)

    # --- 2. Semantic Similarity ---
    resume_text = candidate.get("extracted_text") or " ".join(candidate.get("skills") or [])
    job_text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(required_skills)} {' '.join(preferred_skills)}"
    semantic_score = compute_semantic_similarity(resume_text, job_text)

    # --- 3. Experience Match ---
    cand_exp = float(candidate.get("experience") or 0.0)
    min_exp = float(job.get("min_experience") or 0.0)
    max_exp = float(job.get("max_experience") or 10.0)

    if min_exp <= 0:
        exp_score = 90.0 if cand_exp > 0 else 80.0
    elif cand_exp >= min_exp:
        # Full score if meets min; slight bonus up to max
        exp_score = 95.0 if cand_exp <= max_exp + 2 else 90.0
    else:
        # Partial score proportional to experience
        exp_score = min(90.0, (cand_exp / min_exp) * 85.0)

    exp_score = round(exp_score, 1)

    # --- 4. Education Match ---
    cand_edu = candidate.get("education") or []
    if isinstance(cand_edu, list) and len(cand_edu) > 0:
        degrees = [str(e.get("degree", "")).lower() for e in cand_edu if isinstance(e, dict)]
        if any("m.tech" in d or "m.s" in d or "ph.d" in d or "master" in d for d in degrees):
            edu_score = 95.0
        elif any("b.tech" in d or "b.e" in d or "bachelor" in d or "b.s" in d for d in degrees):
            edu_score = 90.0
        else:
            edu_score = 80.0
    else:
        # Check in resume text
        r_lower = resume_text.lower()
        if "ph.d" in r_lower or "doctorate" in r_lower or "master" in r_lower or "m.tech" in r_lower:
            edu_score = 90.0
        elif "bachelor" in r_lower or "b.tech" in r_lower or "b.e." in r_lower or "degree" in r_lower:
            edu_score = 85.0
        else:
            edu_score = 75.0

    edu_score = round(edu_score, 1)

    # --- Composite Overall Matching Score ---
    overall_score = round(
        0.40 * semantic_score +
        0.35 * skill_score +
        0.15 * exp_score +
        0.10 * edu_score,
        1
    )
    overall_score = min(100.0, max(0.0, overall_score))

    # --- Natural Language Evidence ---
    evidence_parts = []
    if matched_required:
        evidence_parts.append(
            f"Candidate matched {len(matched_required)} of {len(required_skills)} required skill(s): {', '.join(matched_required)}."
        )
    if missing_required:
        evidence_parts.append(
            f"Missing required skill(s): {', '.join(missing_required)}."
        )
    if matched_preferred:
        evidence_parts.append(
            f"Bonus preferred skill(s) detected: {', '.join(matched_preferred)}."
        )

    if cand_exp >= min_exp and min_exp > 0:
        evidence_parts.append(f"Meets experience requirement with {cand_exp:.1f} years.")
    elif min_exp > 0:
        evidence_parts.append(f"Experience ({cand_exp:.1f} yrs) is below minimum of {min_exp:.1f} yrs.")

    evidence_parts.append(f"Semantic alignment score with role responsibilities is {semantic_score}%.")

    evidence = " ".join(evidence_parts)

    return {
        "matching_score": overall_score,
        "score_breakdown": {
            "skillMatch": skill_score,
            "semanticSimilarity": semantic_score,
            "experienceMatch": exp_score,
            "educationMatch": edu_score,
        },
        "matched_skills": matched_required + matched_preferred,
        "missing_skills": missing_required,
        "evidence": evidence,
    }
