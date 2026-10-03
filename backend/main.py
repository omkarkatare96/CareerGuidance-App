from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json
import re
import requests
import time
from typing import Dict, Optional, List

# ------------------ Load Environment ------------------

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in environment variables")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Frontend URL for CORS (set FRONTEND_URL env var in production)
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

# ------------------ FastAPI App ------------------

app = FastAPI()

# Enable CORS for frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if FRONTEND_URL:
    origins.append(FRONTEND_URL)
    # Also add without trailing slash variant
    origins.append(FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Request Models ------------------

class DiscoverRequest(BaseModel):
    pressure_fear: str
    life_preference: str
    team_role: str
    failure_response: str
    energy_drain: str
    risk_tolerance: str
    custom_inputs: Optional[Dict[str, str]] = {}


class StreamAnalysisRequest(BaseModel):
    selected_stream: str
    answers: Dict[str, str]  # q1, q2, q3, q4


class RoadmapRequest(BaseModel):
    discover_result: dict
    goals: str
    selected_stream: Optional[str] = ""


# ------------------ Health Routes ------------------

@app.get("/")
async def root():
    return {"message": "CareerCoach AI Backend Running"}


@app.get("/health")
async def health():
    return {"status": "OK"}


# ------------------ Helper Function ------------------

def call_openrouter(prompt: str, retries: int = 1):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "openrouter/free",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    for attempt in range(retries + 1):
        try:
            response = requests.post(OPENROUTER_URL, headers=headers, json=payload)
            response.raise_for_status()
            response_json = response.json()

            if "choices" not in response_json or not response_json["choices"]:
                raise Exception(f"Invalid OpenRouter response: {response_json}")

            text_output = response_json["choices"][0]["message"]["content"]

            # Try to find JSON block in markdown code blocks first
            code_block_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text_output, re.DOTALL)
            if code_block_match:
                cleaned = code_block_match.group(1)
                return json.loads(cleaned)

            # Fallback: Extract JSON object using regex
            json_match = re.search(r"\{.*\}", text_output, re.DOTALL)
            if json_match:
                cleaned = json_match.group(0)
                return json.loads(cleaned)
            
            # Last resort: try cleaning
            cleaned = re.sub(r"```json|```", "", text_output).strip()
            return json.loads(cleaned)

        except (json.JSONDecodeError, Exception) as e:
            if attempt < retries:
                time.sleep(1)
                continue
            
            print(f"OpenRouter Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"OpenRouter Error Details: {getattr(e.response, 'text', 'No text in response')}")
            print(f"Raw Response: {text_output if 'text_output' in locals() else 'No response'}")
            raise e


# ------------------ Discover AI Route ------------------

@app.post("/generate-discover")
async def generate_discover(data: DiscoverRequest):
    try:
        prompt = f"""
        ROLE: You are an elite career psychologist, behavioral evaluator, and strategic career coach.
        
        USER PROFILE TO ANALYZE:
        - Reaction to Pressure/Fear: {data.pressure_fear}
        - Life/Work Preference: {data.life_preference}
        - Role in Teams: {data.team_role}
        - Response to Failure: {data.failure_response}
        - Energy Drain Source: {data.energy_drain}
        - Risk Tolerance: {data.risk_tolerance}
        
        Custom Inputs (if any): {data.custom_inputs}

        YOUR TASK:
        Perform a comprehensive, deeply personalized psychological and behavioral career analysis based strictly on the user's answers above. Do NOT provide generic suggestions. Every career recommendation, strength, and behavioral insight must directly map back to their answers.

        REQUIREMENTS:
        1. **Psychology-Based Profile Analysis**:
           - **core_personality_insight**: Deep psychological synthesis (~120 words) analyzing who they are at work, connecting their risk tolerance with their energy drain and pressure handling.
           - **honest_reality_check**: A punchy, unfiltered reality-check sentence about their nature vs typical workplace expectations.
           - **interests**: 4-5 specific interest domains and intellectual curiosities that align with their traits.
           - **behavioral_patterns**: 3-4 observable behavioral patterns in how they handle high-stakes pressure, team collaboration, and setbacks.
           - **strengths**: 4-6 innate strengths (cognitive, emotional, and execution).
           - **work_preferences**: 3-4 concrete workplace environment preferences (degree of autonomy, pace, culture, structure).
           - **motivation**: What fundamentally drives them (autonomy, mastery, financial upside, impact, problem complexity).
           - **career_tendencies**: 3-4 natural career trajectory inclinations and archetypes.
           - **personality_axes**: Score the user from 0-100 on exactly these 6 axes: Leadership, Creativity, Analytical, Social, Endurance, Risk-Taking.
           - **radar_trait_explanation**: Brief explanation of why they scored high/low on each of the 6 traits.

        2. **Career Recommendations with Reasoning**:
           - **suitable_career_streams**: 3-4 specific career fields tailored to their answers. For EACH stream provide:
             * name: field title
             * avgSalaryRange: estimated average salary range (INR per annum, e.g. 'Rs.8L - Rs.22L / yr')
             * reasoning: explicit, in-depth explanation of WHY this career matches their specific answers (citing their reaction to pressure, energy drain, and risk tolerance)
             * match_score: percentage match integer (e.g. 94)
           - **ideal_career_roles**: 4-5 specific job titles matching their team role and energy levels. For EACH role provide:
             * role: title
             * avgStartingSalary: starting salary (INR per annum, fresher level, e.g. 'Rs.5L / yr')
             * reasoning: why this role fits their behavioral profile and team role
           - **career_types_to_avoid**: 3-4 specific jobs/careers that would cause severe burnout or mismatch given their energy drain.
           - **skill_gaps**: 3-4 critical soft or hard skills they need to actively cultivate based on their risk tolerance and failure response.

        3. **Career Roadmap Panel**:
           - **recommended_direction**: The single top recommended career stream/direction from the suitable streams.
           - **direction_summary**: 2-3 sentences summarizing this recommended path and why it is the best match.
           - **required_skills**: Object with:
             * technical: 4-6 key technical/domain skills needed for this path
             * soft_skills: 3-5 crucial psychological/interpersonal skills
           - **learning_path**: Structured 3-phase roadmap (phases: phase_1, phase_2, phase_3). For EACH phase include:
             * id: 'phase_1', 'phase_2', 'phase_3'
             * title: descriptive phase name (e.g., 'Foundation & Skill Building', 'Real-World Project Execution', 'Industry Mastery & Launch')
             * subtitle: time period (e.g., 'Year 1 — Months 1-12')
             * focus: 3-4 concrete actionable learning tasks tailored to the recommended direction
             * avoid: 2 common mistakes or pitfalls for this phase
             * resources: 2-3 items with type ('youtube' or 'course'), title (real title), url (real public URL), provider (channel or platform name e.g. freeCodeCamp, Coursera, MIT OpenCourseWare), and estimatedTime
           - **next_steps**: 4-5 immediate, concrete next steps the user should take in the next 7 to 30 days to start their journey.

        Return STRICT JSON ONLY. NO MARKDOWN. NO CODE BLOCKS. Just the raw JSON string.
        Ensure the structure matches exactly:
        {{
            "core_personality_insight": "string",
            "honest_reality_check": "string",
            "interests": ["string", "string", "string", "string"],
            "behavioral_patterns": ["string", "string", "string"],
            "strengths": ["string", "string", "string", "string"],
            "work_preferences": ["string", "string", "string"],
            "motivation": "string",
            "career_tendencies": ["string", "string", "string"],
            "personality_axes": [
                {{"axis": "Leadership", "score": 75}},
                {{"axis": "Creativity", "score": 80}},
                {{"axis": "Analytical", "score": 85}},
                {{"axis": "Social", "score": 60}},
                {{"axis": "Endurance", "score": 70}},
                {{"axis": "Risk-Taking", "score": 65}}
            ],
            "radar_trait_explanation": {{
                "Leadership": "string",
                "Creativity": "string",
                "Analytical": "string",
                "Social": "string",
                "Endurance": "string",
                "Risk-Taking": "string"
            }},
            "suitable_career_streams": [
                {{
                    "name": "string",
                    "avgSalaryRange": "string",
                    "reasoning": "string",
                    "match_score": 92
                }}
            ],
            "ideal_career_roles": [
                {{
                    "role": "string",
                    "avgStartingSalary": "string",
                    "reasoning": "string"
                }}
            ],
            "career_types_to_avoid": ["string", "string", "string"],
            "skill_gaps": ["string", "string", "string"],
            "career_roadmap": {{
                "recommended_direction": "string",
                "direction_summary": "string",
                "required_skills": {{
                    "technical": ["string", "string", "string"],
                    "soft_skills": ["string", "string", "string"]
                }},
                "learning_path": [
                    {{
                        "id": "phase_1",
                        "title": "string",
                        "subtitle": "string",
                        "focus": ["string", "string", "string"],
                        "avoid": ["string", "string"],
                        "resources": [
                            {{
                                "type": "youtube",
                                "title": "string",
                                "url": "string",
                                "provider": "string",
                                "estimatedTime": "string"
                            }}
                        ]
                    }}
                ],
                "next_steps": ["string", "string", "string", "string"]
            }}
        }}
        """
        return call_openrouter(prompt)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ Stream Analysis Route ------------------

@app.post("/generate-stream-analysis")
async def generate_stream_analysis(data: StreamAnalysisRequest):
    try:
        prompt = f"""
        You are a career stream psychologist and behavioral evaluator.

        The student selected: {data.selected_stream}
        Behavioral answers: {json.dumps(data.answers)}

        Analyze:
        - Motivation source (passion / money / pressure / safety)
        - Patience
        - Risk tolerance
        - Emotional resilience
        - Pressure handling

        Calculate:
        - alignment_score (0–100)
        - fit_level (Strong Fit / Conditional Fit / High Risk of Regret)

        Generate dynamic analysis (NOT static template).

        Return STRICT JSON ONLY:

        {{
          "alignment_score": number,
          "fit_level": "string",
          "core_analysis": "string",
          "strengths": ["string"],
          "risk_factors": ["string"],
          "improvement_advice": ["string"],
          "final_verdict": "string"
        }}
        """
        return call_openrouter(prompt)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ Roadmap AI Route ------------------

@app.post("/generate-roadmap")
async def generate_roadmap(data: RoadmapRequest):
    try:
        stream_focus = data.selected_stream if data.selected_stream else "the most suitable career stream"
        
        prompt = f"""
        You are a professional career planner specializing in creating structured, actionable roadmaps for students.

        USER'S SELECTED STREAM: {stream_focus}
        Generate a roadmap STRICTLY for: {stream_focus}. Do NOT suggest other streams or generalize.

        User Goals: {data.goals}

        Behavioral Profile Summary: {data.discover_result}

        Create a structured 3-year roadmap with 3 phases. For EACH phase include:
        - title (e.g. "Foundation", "Skill Building", "Launch")
        - subtitle (time period, e.g. "Year 1 — Months 1-12")
        - focus: 3-5 specific, actionable tasks tailored to {stream_focus}
        - avoid: 2-3 common mistakes specific to this stream and phase
        - resources: 2-3 items. Each resource MUST have all these fields:
          - type: exactly "youtube" OR "course"
          - title: exact real title of the video/course
          - url: real, publicly accessible URL (must be a real link)
          - provider: channel name or platform (e.g. "freeCodeCamp", "Traversy Media", "Coursera", "Google Career Certificates")
          - estimatedTime: e.g. "4 hours", "6 weeks"
          For YouTube resources: prefer freeCodeCamp, Traversy Media, Kevin Powell, Fireship, TechWorld with Nana.
          For courses: prefer Google Career Certificates on Coursera, or well-known free Coursera courses.
          ONLY include real, publicly verifiable URLs. Do NOT invent URLs.

        Return STRICT JSON ONLY. NO MARKDOWN. NO CODE BLOCKS.

        {{
          "phases": [
            {{
              "id": "phase_1",
              "title": "string",
              "subtitle": "string",
              "focus": ["string", "string", "string"],
              "avoid": ["string", "string"],
              "resources": [
                {{
                  "type": "youtube",
                  "title": "string",
                  "url": "string",
                  "provider": "string",
                  "estimatedTime": "string"
                }},
                {{
                  "type": "course",
                  "title": "string",
                  "url": "string",
                  "provider": "string",
                  "estimatedTime": "string"
                }}
              ]
            }},
            {{
              "id": "phase_2",
              "title": "string",
              "subtitle": "string",
              "focus": ["string", "string", "string"],
              "avoid": ["string", "string"],
              "resources": [
                {{
                  "type": "youtube",
                  "title": "string",
                  "url": "string",
                  "provider": "string",
                  "estimatedTime": "string"
                }},
                {{
                  "type": "course",
                  "title": "string",
                  "url": "string",
                  "provider": "string",
                  "estimatedTime": "string"
                }}
              ]
            }},
            {{
              "id": "phase_3",
              "title": "string",
              "subtitle": "string",
              "focus": ["string", "string", "string"],
              "avoid": ["string", "string"],
              "resources": [
                {{
                  "type": "youtube",
                  "title": "string",
                  "url": "string",
                  "provider": "string",
                  "estimatedTime": "string"
                }},
                {{
                  "type": "course",
                  "title": "string",
                  "url": "string",
                  "provider": "string",
                  "estimatedTime": "string"
                }}
              ]
            }}
          ]
        }}
        """
        return call_openrouter(prompt)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ Sprint AI Route ------------------

class SprintRequest(BaseModel):
    selectedStream: str
    roadmapPhase1Focus: List[str]
    personalityProfile: str


@app.post("/generate-sprint")
async def generate_sprint(data: SprintRequest):
    try:
        focus_str = "\n".join(f"- {f}" for f in data.roadmapPhase1Focus)

        prompt = f"""
        You are an elite career coach creating a hyper-specific 90-day action plan.

        Target Career Stream: {data.selectedStream}
        Phase 1 Roadmap Focus:
        {focus_str}
        Student Personality Profile: {data.personalityProfile}

        Create EXACTLY 12 weeks of tasks (3 tasks per week = 36 tasks total).
        Each task must be:
        - Concrete and immediately actionable (not vague like "learn Python")
        - Specific to {data.selectedStream}
        - Progressively harder across weeks (Week 1 = beginner basics, Week 12 = near-professional level)
        - Include a real, publicly accessible learning resource URL per task
        - Prefer: YouTube (freeCodeCamp, Traversy Media, Fireship, The Coding Train), Coursera, MDN, official docs

        Each week should have a short motivational theme (e.g. "HTML Foundations", "CSS Mastery", etc.)

        Return STRICT JSON ONLY. No markdown. No code blocks.

        {{
          "weeks": [
            {{
              "week": 1,
              "theme": "string",
              "tasks": [
                {{
                  "id": "w1_t1",
                  "task": "string (specific, actionable task description)",
                  "resourceUrl": "string (real URL)",
                  "resourceName": "string (resource title or channel name)",
                  "estimatedTime": "string (e.g. '2 hours')"
                }},
                {{
                  "id": "w1_t2",
                  "task": "string",
                  "resourceUrl": "string",
                  "resourceName": "string",
                  "estimatedTime": "string"
                }},
                {{
                  "id": "w1_t3",
                  "task": "string",
                  "resourceUrl": "string",
                  "resourceName": "string",
                  "estimatedTime": "string"
                }}
              ]
            }}
          ]
        }}

        Include all 12 weeks with exactly 3 tasks each (ids: w1_t1 through w12_t3).
        """

        return call_openrouter(prompt)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
