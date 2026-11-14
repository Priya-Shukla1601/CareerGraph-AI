import sys
import json
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from starlette.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import Candidate, Job, Match, Notification, UserProfile

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("CAREERGRAPH AI - BACKEND INTEGRATION TEST SUITE")
    print("=" * 60)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print("[PASS] GET /health ->", health_data)

    # 2. Candidate list
    res = client.get("/api/candidates")
    assert res.status_code == 200, f"Get candidates failed: {res.text}"
    candidates_data = res.json()
    print(f"[PASS] GET /api/candidates -> Found {candidates_data['total']} candidate(s)")
    assert candidates_data['total'] >= 1, "Expected at least 1 candidate in database"
    candidate = candidates_data['candidates'][0]
    cand_id = candidate['id']
    print(f"       First Candidate: '{candidate['name']}', Email: '{candidate['email']}', Skills: {candidate['skills']}")

    # 3. Single candidate
    res = client.get(f"/api/candidates/{cand_id}")
    assert res.status_code == 200, f"Get single candidate failed: {res.text}"
    single_cand = res.json()['candidate']
    print(f"[PASS] GET /api/candidates/{cand_id} -> Name: '{single_cand['name']}'")

    # 4. Job Creation
    job_payload = {
        "title": "Machine Learning Engineer",
        "company": "TechNova AI",
        "description": "We are seeking a Machine Learning Engineer proficient in Python, Scikit-learn, Data Science, and SQL to develop intelligent NLP models and predictive systems.",
        "requiredSkills": ["Python", "Machine Learning", "Scikit-learn", "SQL", "Pandas"],
        "preferredSkills": ["NumPy", "NLP", "PyTorch"],
        "minExperience": 0.0,
        "maxExperience": 5.0
    }
    res = client.post("/api/jobs", json=job_payload)
    assert res.status_code == 200, f"Create job failed: {res.text}"
    job = res.json()
    job_id = job['id']
    print(f"[PASS] POST /api/jobs -> Created Job ID: {job_id}, Title: '{job['title']}'")

    # 5. Get Jobs
    res = client.get("/api/jobs")
    assert res.status_code == 200, f"Get jobs failed: {res.text}"
    jobs_list = res.json()
    print(f"[PASS] GET /api/jobs -> Total jobs: {len(jobs_list)}")

    # 6. Run AI Matching Pipeline
    print("\n--- Running AI Matching Pipeline ---")
    res = client.post(f"/api/jobs/{job_id}/match")
    assert res.status_code == 200, f"Match candidates failed: {res.text}"
    match_result = res.json()
    print(f"[PASS] POST /api/jobs/{job_id}/match -> Total matched: {match_result['total']}")
    for c in match_result['candidates']:
        print(f"       Candidate: {c['name']}")
        print(f"       Matching Score: {c['matchingScore']}% (Tier: {c.get('tier')}, Rank: {c.get('rank')})")
        print(f"       Score Breakdown: {c['scoreBreakdown']}")
        print(f"       Matched Skills: {c['matchedSkills']}")
        print(f"       Missing Skills: {c['missingSkills']}")
        print(f"       Evidence: {c['evidence']}")
        assert c['matchingScore'] > 0, "Matching score should be positive"
        assert c['scoreBreakdown'] is not None, "Score breakdown should not be None"

    # 7. Compare Candidates
    res = client.post("/api/candidates/compare", json={"ids": [cand_id]})
    assert res.status_code == 200, f"Compare candidates failed: {res.text}"
    compared = res.json()['candidates']
    print(f"[PASS] POST /api/candidates/compare -> Returned {len(compared)} candidate(s)")

    # 8. Analytics
    res = client.get("/api/analytics")
    assert res.status_code == 200, f"Get analytics failed: {res.text}"
    analytics = res.json()['analytics']
    print(f"[PASS] GET /api/analytics -> Candidates: {analytics['totalCandidates']}, Active Jobs: {analytics['activeJobs']}")
    print(f"       Top Skills: {[s['skill'] for s in analytics['skillDemand'][:5]]}")
    print(f"       Recent Activity count: {len(analytics['recentActivity'])}")

    # 9. Notifications
    res = client.get("/api/notifications")
    assert res.status_code == 200, f"Get notifications failed: {res.text}"
    notifs = res.json()['notifications']
    print(f"[PASS] GET /api/notifications -> Found {len(notifs)} notification(s)")

    # 10. User Profile
    res = client.get("/api/user/profile")
    assert res.status_code == 200, f"Get user profile failed: {res.text}"
    profile = res.json()['profile']
    print(f"[PASS] GET /api/user/profile -> Recruiter: '{profile['name']}', Role: '{profile['role']}'")

    print("\n" + "=" * 60)
    print("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
