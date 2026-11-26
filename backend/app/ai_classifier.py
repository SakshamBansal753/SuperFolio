import json
import re
from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

VALID_LABELS = ["Applied", "Screening", "Interview", "Offer", "Rejected", "Promotional"]

CLASSIFY_SYSTEM_PROMPT = (
    "You are an expert recruiter email classifier. "
    "Classify the given email into exactly ONE category from this list: "
    "Applied, Screening, Interview, Offer, Rejected, Promotional.\n\n"
    "Definitions:\n"
    "- Applied: Direct confirmation from an employer or ATS that an application was received for a job.\n"
    "- Screening: Request from a recruiter or company for an initial phone screen, recruiter chat, or assessment.\n"
    "- Interview: Interview scheduling, technical interview invite, or interview loop confirmation with a company.\n"
    "- Offer: Formal employment or job offer letter.\n"
    "- Rejected: Explicit rejection or 'decided to move forward with other candidates'.\n"
    "- Promotional: Job alert digests, newsletters (e.g. Naukri MINIs, LinkedIn job recommendations), marketing, salary advice, courses, or automated digests that are NOT direct communications from an employer about an active application.\n\n"
    "Respond with ONLY the single category name, nothing else."
)

EXTRACT_SYSTEM_PROMPT = (
    "You analyze recruiting and career emails. Extract:\n"
    "1. category: Exactly ONE of [Applied, Screening, Interview, Offer, Rejected, Promotional]\n"
    "2. company: The hiring company name (e.g. 'Oasis Infobyte', 'Indeed', 'Stripe', 'Google'). Empty string if Promotional.\n"
    "3. role: The job title or internship title (e.g. 'Web Developer Intern', 'Full Stack Developer'). Empty string if Promotional.\n\n"
    "Reply with ONLY a valid JSON object matching: {\"category\": \"...\", \"company\": \"...\", \"role\": \"...\"}"
)


def classify_email(subject: str, body: str) -> str:
    """Sends one email's subject + body to Groq, gets back exactly one stage label."""
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            max_completion_tokens=200,
            messages=[
                {"role": "system", "content": CLASSIFY_SYSTEM_PROMPT},
                {"role": "user", "content": f"Subject: {subject}\n\nBody:\n{body[:3000]}"},
            ],
        )
        content = (completion.choices[0].message.content or "").strip()

        for label in VALID_LABELS:
            if re.search(rf"\b{label}\b", content, re.IGNORECASE):
                return label

        reasoning = getattr(completion.choices[0].message, "reasoning", "") or ""
        for label in ["Promotional", "Offer", "Interview", "Screening", "Rejected", "Applied"]:
            if re.search(rf"\b{label}\b", reasoning, re.IGNORECASE):
                return label

        return "Promotional" if any(w in (subject + body).lower() for w in ["naukri", "newsletter", "digest", "article", "lpa", "salary", "udemy", "leetcode"]) else "Applied"
    except Exception as e:
        print(f"Error in classify_email: {e}")
        return "Applied"


def extract_job_details(subject: str, body: str) -> dict:
    """Extracts category, company, and role from the email."""
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            max_completion_tokens=250,
            messages=[
                {"role": "system", "content": EXTRACT_SYSTEM_PROMPT},
                {"role": "user", "content": f"Subject: {subject}\n\nBody:\n{body[:3000]}"},
            ],
        )
        content = (completion.choices[0].message.content or "").strip()
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            data = json.loads(match.group(0))
            cat = data.get("category", "")
            if cat not in VALID_LABELS:
                for l in VALID_LABELS:
                    if l.lower() in cat.lower():
                        data["category"] = l
                        break
                else:
                    data["category"] = classify_email(subject, body)
            return {
                "category": data.get("category", "Applied"),
                "company": (data.get("company") or "").strip()[:100],
                "role": (data.get("role") or "").strip()[:100],
            }
    except Exception as e:
        print(f"Error in extract_job_details: {e}")

    # Fallback
    cat = classify_email(subject, body)
    return {"category": cat, "company": "", "role": ""}
