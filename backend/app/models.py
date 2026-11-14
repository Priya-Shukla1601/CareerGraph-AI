import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON
)
from app.database import Base


def generate_id():
    return str(uuid.uuid4())


def current_time():
    return datetime.now(timezone.utc)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, default=generate_id)

    name = Column(String, nullable=False)
    email = Column(String, default="")
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)

    job_role = Column(String, default="Not specified")
    job_id = Column(String, default="")

    matching_score = Column(Float, default=0.0)
    status = Column(String, default="pending")

    skills = Column(JSON, default=list)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)

    experience = Column(Float, default=0.0)
    education = Column(JSON, default=list)
    work_history = Column(JSON, default=list)

    resume_file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    extracted_text = Column(Text, default="")

    evidence = Column(Text, nullable=True)
    score_breakdown = Column(JSON, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), default=current_time)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=generate_id)

    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(Text, default="")

    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)

    min_experience = Column(Float, default=0.0)
    max_experience = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), default=current_time)
    status = Column(String, default="active")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, default=generate_id)

    candidate_id = Column(
        String,
        ForeignKey("candidates.id"),
        nullable=False
    )

    job_id = Column(
        String,
        ForeignKey("jobs.id"),
        nullable=False
    )

    matching_score = Column(Float, default=0.0)
    skill_match = Column(Float, default=0.0)
    experience_match = Column(Float, default=0.0)
    education_match = Column(Float, default=0.0)
    semantic_similarity = Column(Float, default=0.0)

    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), default=current_time)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_id)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")  # "info", "success", "warning", "match"
    read = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=current_time)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, default="Priya Shukla")
    email = Column(String, default="priya.recruiter@careergraph.ai")
    role = Column(String, default="Senior Technical Recruiter & AI Lead")
    department = Column(String, default="Talent Acquisition & AI Systems")
    company = Column(String, default="CareerGraph AI")
    location = Column(String, default="Bengaluru, India")
    bio = Column(String, default="Managing intelligent recruitment pipelines, transformer-based screening, and candidate ranking.")
    avatar = Column(String, default="P")
    updated_at = Column(DateTime(timezone=True), default=current_time)
