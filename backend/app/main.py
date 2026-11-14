from pathlib import Path
from datetime import datetime, timezone
import uuid
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import Base, engine, get_db
from app.models import Candidate, Job, Match, Notification, UserProfile
from app.nlp.extraction.resume_parser import parse_resume
from app.nlp.matching.semantic_matcher import evaluate_candidate_match
from app.nlp.ranking.ranker import rank_candidates


# --------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="CareerGraph AI",
    description="Transformer-Based Intelligent Resume Screening and Job Matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# PERMANENT RESUME STORAGE
# --------------------------------------------------

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# SERIALIZATION HELPERS
# --------------------------------------------------

def serialize_candidate(c: Candidate) -> Dict[str, Any]:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email or "",
        "phone": c.phone or "",
        "location": c.location or "",
        "jobRole": c.job_role or "Not specified",
        "jobId": c.job_id or "",
        "matchingScore": float(c.matching_score or 0.0),
        "status": c.status or "pending",
        "skills": c.skills or [],
        "matchedSkills": c.matched_skills or [],
        "missingSkills": c.missing_skills or [],
        "experience": float(c.experience or 0.0),
        "education": c.education or [],
        "workHistory": c.work_history or [],
        "resumeFileName": c.resume_file_name or "",
        "uploadedAt": c.uploaded_at.isoformat() if c.uploaded_at else None,
        "evidence": c.evidence or "",
        "scoreBreakdown": c.score_breakdown
    }


def serialize_job(j: Job, candidate_count: int = 0) -> Dict[str, Any]:
    return {
        "id": j.id,
        "title": j.title,
        "company": j.company,
        "description": j.description or "",
        "requiredSkills": j.required_skills or [],
        "preferredSkills": j.preferred_skills or [],
        "minExperience": float(j.min_experience or 0.0),
        "maxExperience": float(j.max_experience or 0.0),
        "createdAt": j.created_at.isoformat() if j.created_at else None,
        "candidateCount": candidate_count,
        "status": j.status or "active"
    }


def serialize_notification(n: Notification) -> Dict[str, Any]:
    return {
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "read": bool(n.read),
        "createdAt": n.created_at.isoformat() if n.created_at else None
    }


def serialize_profile(p: UserProfile) -> Dict[str, Any]:
    return {
        "id": p.id,
        "name": p.name,
        "email": p.email,
        "role": p.role,
        "department": p.department,
        "company": p.company,
        "location": p.location,
        "bio": p.bio,
        "avatar": p.avatar,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None
    }


def add_system_notification(db: Session, title: str, message: str, notif_type: str = "info"):
    try:
        notif = Notification(
            title=title,
            message=message,
            type=notif_type,
            read=0,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notif)
        db.commit()
    except Exception:
        db.rollback()


# --------------------------------------------------
# BASIC / HEALTH ROUTES
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "project": "CareerGraph AI",
        "description": "Transformer-Based Intelligent Resume Screening and Job Matching System",
        "status": "Online",
        "version": "1.0.0"
    }


@app.get("/health")
def health(db: Session = Depends(get_db)):
    candidates_count = db.query(Candidate).count()
    jobs_count = db.query(Job).count()
    return {
        "status": "healthy",
        "database": "connected",
        "storage": str(UPLOAD_DIR),
        "records": {
            "candidates": candidates_count,
            "jobs": jobs_count
        }
    }


# --------------------------------------------------
# RESUME UPLOAD & PARSING
# --------------------------------------------------

@app.post("/api/resumes/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    allowed_extensions = {".pdf", ".docx"}
    original_filename = file.filename or "resume.pdf"
    file_extension = Path(original_filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 15 MB."
        )

    candidate_id = str(uuid.uuid4())
    saved_filename = f"{candidate_id}{file_extension}"
    saved_path = UPLOAD_DIR / saved_filename

    try:
        # Save resume file permanently on disk
        saved_path.write_bytes(contents)

        # Parse resume through NLP extraction engine
        parsed = parse_resume(str(saved_path))

        candidate = Candidate(
            id=candidate_id,
            name=parsed.get("name") or Path(original_filename).stem,
            email=parsed.get("email") or "",
            phone=parsed.get("phone") or "",
            location=parsed.get("location") or "",
            job_role="Not specified",
            job_id="",
            matching_score=0.0,
            status="pending",
            skills=parsed.get("skills", []),
            matched_skills=[],
            missing_skills=[],
            experience=parsed.get("experience", 0.0),
            education=parsed.get("education", []),
            work_history=[],
            resume_file_name=original_filename,
            file_path=str(saved_path),
            extracted_text=parsed.get("extracted_text", ""),
            uploaded_at=datetime.now(timezone.utc)
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        add_system_notification(
            db,
            title="Resume Uploaded",
            message=f"Uploaded and extracted skills for candidate {candidate.name}",
            notif_type="success"
        )

        return {
            "success": True,
            "message": "Resume uploaded and saved successfully!",
            "candidate": {
                **serialize_candidate(candidate),
                "filename": candidate.resume_file_name,
                "extracted_text": candidate.extracted_text
            }
        }

    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(error)}"
        )
    finally:
        await file.close()


@app.get("/api/resumes/{candidate_id}/parse")
def get_parsed_resume(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    return {
        "success": True,
        "candidate": serialize_candidate(candidate),
        "extracted_text": candidate.extracted_text
    }


# --------------------------------------------------
# CANDIDATES ENDPOINTS
# --------------------------------------------------

@app.get("/api/candidates")
def get_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).order_by(Candidate.uploaded_at.desc()).all()
    return {
        "success": True,
        "total": len(candidates),
        "candidates": [serialize_candidate(c) for c in candidates]
    }


@app.get("/api/candidates/{candidate_id}")
def get_candidate(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    return {
        "success": True,
        "candidate": serialize_candidate(candidate)
    }


@app.patch("/api/candidates/{candidate_id}/status")
def update_candidate_status(
    candidate_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    new_status = payload.get("status")
    if new_status not in {"shortlisted", "pending", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid candidate status.")

    candidate.status = new_status
    db.commit()
    db.refresh(candidate)

    add_system_notification(
        db,
        title="Candidate Status Updated",
        message=f"{candidate.name} is now marked as {new_status}.",
        notif_type="info"
    )

    return {
        "success": True,
        "message": "Candidate status updated successfully.",
        "candidate": serialize_candidate(candidate)
    }


@app.delete("/api/candidates/{candidate_id}")
def delete_candidate(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    # Remove file from disk
    if candidate.file_path:
        file_p = Path(candidate.file_path)
        if file_p.exists():
            try:
                file_p.unlink()
            except Exception:
                pass

    # Delete matches
    db.query(Match).filter(Match.candidate_id == candidate_id).delete()

    candidate_name = candidate.name
    db.delete(candidate)
    db.commit()

    add_system_notification(
        db,
        title="Candidate Deleted",
        message=f"Removed candidate {candidate_name} and deleted associated resume file.",
        notif_type="warning"
    )

    return {
        "success": True,
        "message": f"Candidate {candidate_name} deleted successfully."
    }


@app.post("/api/candidates/compare")
def compare_candidates(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    candidate_ids = payload.get("ids", [])
    if not candidate_ids:
        return {"success": True, "candidates": []}

    candidates = db.query(Candidate).filter(Candidate.id.in_(candidate_ids)).all()
    return {
        "success": True,
        "candidates": [serialize_candidate(c) for c in candidates]
    }


# --------------------------------------------------
# JOB DESCRIPTIONS ENDPOINTS
# --------------------------------------------------

@app.post("/api/jobs")
def create_job(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    title = (payload.get("title") or "").strip()
    company = (payload.get("company") or "").strip()

    if not title or not company:
        raise HTTPException(status_code=400, detail="Title and Company are required.")

    job = Job(
        id=str(uuid.uuid4()),
        title=title,
        company=company,
        description=payload.get("description", "").strip(),
        required_skills=payload.get("requiredSkills", []),
        preferred_skills=payload.get("preferredSkills", []),
        min_experience=float(payload.get("minExperience", 0.0)),
        max_experience=float(payload.get("maxExperience", 5.0)),
        status="active",
        created_at=datetime.now(timezone.utc)
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    add_system_notification(
        db,
        title="Job Created",
        message=f"Created job posting '{job.title}' for {job.company}.",
        notif_type="info"
    )

    return serialize_job(job, candidate_count=0)


@app.get("/api/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    results = []

    for job in jobs:
        # Count candidates associated with this job
        match_count = db.query(Match).filter(Match.job_id == job.id).count()
        if match_count == 0:
            match_count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
        results.append(serialize_job(job, candidate_count=match_count))

    return results


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    match_count = db.query(Match).filter(Match.job_id == job.id).count()
    return serialize_job(job, candidate_count=match_count)


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    db.query(Match).filter(Match.job_id == job_id).delete()
    job_title = job.title
    db.delete(job)
    db.commit()

    add_system_notification(
        db,
        title="Job Deleted",
        message=f"Deleted job posting '{job_title}'.",
        notif_type="warning"
    )

    return {
        "success": True,
        "message": f"Job {job_title} deleted successfully."
    }


# --------------------------------------------------
# AI MATCHING & RANKING PIPELINE
# --------------------------------------------------

@app.post("/api/jobs/{job_id}/match")
def match_candidates_for_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    candidates = db.query(Candidate).all()
    if not candidates:
        return {
            "success": True,
            "message": "No candidates uploaded yet in the database.",
            "candidates": []
        }

    job_dict = {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills or [],
        "preferred_skills": job.preferred_skills or [],
        "min_experience": job.min_experience,
        "max_experience": job.max_experience,
    }

    evaluated_candidates = []

    for candidate in candidates:
        cand_dict = {
            "id": candidate.id,
            "skills": candidate.skills or [],
            "extracted_text": candidate.extracted_text or "",
            "experience": candidate.experience or 0.0,
            "education": candidate.education or [],
        }

        # Multi-dimensional transformer & semantic matching
        evaluation = evaluate_candidate_match(cand_dict, job_dict)

        # Update candidate entity
        candidate.matching_score = evaluation["matching_score"]
        candidate.job_role = job.title
        candidate.job_id = job.id
        candidate.matched_skills = evaluation["matched_skills"]
        candidate.missing_skills = evaluation["missing_skills"]
        candidate.score_breakdown = evaluation["score_breakdown"]
        candidate.evidence = evaluation["evidence"]

        # Upsert match table record
        existing_match = db.query(Match).filter(
            Match.candidate_id == candidate.id,
            Match.job_id == job.id
        ).first()

        if not existing_match:
            new_match = Match(
                candidate_id=candidate.id,
                job_id=job.id,
                matching_score=evaluation["matching_score"],
                skill_match=evaluation["score_breakdown"]["skillMatch"],
                experience_match=evaluation["score_breakdown"]["experienceMatch"],
                education_match=evaluation["score_breakdown"]["educationMatch"],
                semantic_similarity=evaluation["score_breakdown"]["semanticSimilarity"],
                matched_skills=evaluation["matched_skills"],
                missing_skills=evaluation["missing_skills"],
                created_at=datetime.now(timezone.utc)
            )
            db.add(new_match)
        else:
            existing_match.matching_score = evaluation["matching_score"]
            existing_match.skill_match = evaluation["score_breakdown"]["skillMatch"]
            existing_match.experience_match = evaluation["score_breakdown"]["experienceMatch"]
            existing_match.education_match = evaluation["score_breakdown"]["educationMatch"]
            existing_match.semantic_similarity = evaluation["score_breakdown"]["semanticSimilarity"]
            existing_match.matched_skills = evaluation["matched_skills"]
            existing_match.missing_skills = evaluation["missing_skills"]

        evaluated_candidates.append(serialize_candidate(candidate))

    db.commit()

    # Rank candidates by score
    ranked = rank_candidates(evaluated_candidates)

    add_system_notification(
        db,
        title="AI Matching Complete",
        message=f"Matched and ranked {len(candidates)} candidate(s) for {job.title}.",
        notif_type="match"
    )

    return {
        "success": True,
        "job": serialize_job(job, candidate_count=len(ranked)),
        "total": len(ranked),
        "candidates": ranked
    }


@app.get("/api/jobs/{job_id}/rank")
def get_job_ranked_candidates(
    job_id: str,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    # Fetch candidates evaluated for this job or all candidates
    candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
    if not candidates:
        candidates = db.query(Candidate).all()

    serialized = [serialize_candidate(c) for c in candidates]
    ranked = rank_candidates(serialized)

    return ranked


# --------------------------------------------------
# ANALYTICS ENDPOINT
# --------------------------------------------------

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    jobs = db.query(Job).all()

    total_candidates = len(candidates)
    total_resumes = total_candidates
    active_jobs = sum(1 for j in jobs if j.status == "active")
    shortlisted = sum(1 for c in candidates if c.status == "shortlisted")

    # Score distribution
    score_bins = {
        "0–20": 0,
        "20–40": 0,
        "40–60": 0,
        "60–70": 0,
        "70–80": 0,
        "80–90": 0,
        "90–100": 0,
    }
    for c in candidates:
        s = c.matching_score or 0.0
        if s <= 20:
            score_bins["0–20"] += 1
        elif s <= 40:
            score_bins["20–40"] += 1
        elif s <= 60:
            score_bins["40–60"] += 1
        elif s <= 70:
            score_bins["60–70"] += 1
        elif s <= 80:
            score_bins["70–80"] += 1
        elif s <= 90:
            score_bins["80–90"] += 1
        else:
            score_bins["90–100"] += 1

    score_distribution = [{"range": k, "count": v} for k, v in score_bins.items()]

    # Skill Demand / Distribution
    skill_counts: Dict[str, int] = {}
    for j in jobs:
        for sk in (j.required_skills or []) + (j.preferred_skills or []):
            skill_counts[sk] = skill_counts.get(sk, 0) + 1
    for c in candidates:
        for sk in (c.skills or []):
            skill_counts[sk] = skill_counts.get(sk, 0) + 1

    sorted_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    skill_demand = [{"skill": k, "count": v} for k, v in sorted_skills]
    if not skill_demand:
        skill_demand = [
            {"skill": "Python", "count": 1},
            {"skill": "Machine Learning", "count": 1},
            {"skill": "SQL", "count": 1}
        ]

    # Experience Distribution
    exp_bins = {
        "0–1 yr": 0,
        "1–2 yrs": 0,
        "2–4 yrs": 0,
        "4–6 yrs": 0,
        "6–10 yrs": 0,
        "10+ yrs": 0,
    }
    for c in candidates:
        e = c.experience or 0.0
        if e <= 1:
            exp_bins["0–1 yr"] += 1
        elif e <= 2:
            exp_bins["1–2 yrs"] += 1
        elif e <= 4:
            exp_bins["2–4 yrs"] += 1
        elif e <= 6:
            exp_bins["4–6 yrs"] += 1
        elif e <= 10:
            exp_bins["6–10 yrs"] += 1
        else:
            exp_bins["10+ yrs"] += 1

    experience_distribution = [{"range": k, "count": v} for k, v in exp_bins.items()]

    # Job Candidate Distribution
    job_candidates = []
    for j in jobs:
        cnt = db.query(Match).filter(Match.job_id == j.id).count()
        if cnt == 0:
            cnt = db.query(Candidate).filter(Candidate.job_id == j.id).count()
        job_candidates.append({"job": j.title[:15], "count": cnt})

    # Recent Activity
    notifications = (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .limit(10)
        .all()
    )
    recent_activity = [
        {
            "name": n.title,
            "action": n.message,
            "time": n.created_at.strftime("%d %b %H:%M") if n.created_at else "Just now"
        }
        for n in notifications
    ]

    return {
        "success": True,
        "analytics": {
            "totalCandidates": total_candidates,
            "totalResumes": total_resumes,
            "activeJobs": active_jobs,
            "shortlisted": shortlisted,
            "scoreDistribution": score_distribution,
            "skillDemand": skill_demand,
            "experienceDistribution": experience_distribution,
            "jobCandidates": job_candidates,
            "recentActivity": recent_activity
        }
    }


# --------------------------------------------------
# NOTIFICATIONS ENDPOINTS
# --------------------------------------------------

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifs = (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "success": True,
        "notifications": [serialize_notification(n) for n in notifs]
    }


@app.post("/api/notifications/clear")
def clear_notifications(db: Session = Depends(get_db)):
    db.query(Notification).delete()
    db.commit()
    return {"success": True, "message": "All notifications cleared."}


# --------------------------------------------------
# USER PROFILE ENDPOINTS
# --------------------------------------------------

@app.get("/api/user/profile")
def get_user_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(
            name="Priya Shukla",
            email="priya.recruiter@careergraph.ai",
            role="Senior Technical Recruiter & AI Lead",
            department="Talent Acquisition",
            company="CareerGraph AI",
            location="Bengaluru, India",
            bio="Leading technical talent screening using transformer-based semantic matching.",
            avatar="P"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    candidates_count = db.query(Candidate).count()
    jobs_count = db.query(Job).count()
    shortlisted_count = db.query(Candidate).filter(Candidate.status == "shortlisted").count()

    return {
        "success": True,
        "profile": serialize_profile(profile),
        "stats": {
            "resumesScreened": candidates_count,
            "jobsManaged": jobs_count,
            "shortlisted": shortlisted_count
        }
    }


@app.put("/api/user/profile")
def update_user_profile(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)

    if "name" in payload:
        profile.name = payload["name"]
    if "email" in payload:
        profile.email = payload["email"]
    if "role" in payload:
        profile.role = payload["role"]
    if "department" in payload:
        profile.department = payload["department"]
    if "company" in payload:
        profile.company = payload["company"]
    if "location" in payload:
        profile.location = payload["location"]
    if "bio" in payload:
        profile.bio = payload["bio"]
    if "avatar" in payload:
        profile.avatar = payload["avatar"]

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)

    add_system_notification(
        db,
        title="Profile Updated",
        message="User profile settings have been saved successfully.",
        notif_type="info"
    )

    return {
        "success": True,
        "message": "Profile updated successfully.",
        "profile": serialize_profile(profile)
    }
