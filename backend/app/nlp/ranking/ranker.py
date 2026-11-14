from typing import List, Dict, Any


def rank_candidates(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Rank evaluated candidates descending by matching_score.
    Assign rank position and candidate fit tier.
    """
    sorted_candidates = sorted(
        candidates,
        key=lambda c: float(c.get("matching_score") or c.get("matchingScore") or 0.0),
        reverse=True
    )

    total = len(sorted_candidates)
    ranked = []

    for idx, cand in enumerate(sorted_candidates, start=1):
        cand_copy = dict(cand)
        cand_copy["rank"] = idx
        score = float(cand.get("matching_score") or cand.get("matchingScore") or 0.0)

        if score >= 85:
            cand_copy["tier"] = "Top Match"
        elif score >= 70:
            cand_copy["tier"] = "Strong Candidate"
        elif score >= 50:
            cand_copy["tier"] = "Potential Fit"
        else:
            cand_copy["tier"] = "Low Match"

        percentile = round(((total - idx + 1) / max(1, total)) * 100, 1)
        cand_copy["percentile"] = percentile

        ranked.append(cand_copy)

    return ranked
