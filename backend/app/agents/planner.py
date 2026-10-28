import json

from app.schemas.planner import PlannerOutput
from app.services.llm import generate_text

class PlannerAgent:

    def plan(self, query: str) -> PlannerOutput:

        system_prompt = """
You are a research planning agent.

Your job is to break a research question into a small number
of focused research questions.

Return ONLY valid JSON in this exact format:

{
    "steps": [
        {
            "step_number": 1,
            "question": "..."
        }
    ]
}

Rules:
- Keep every step directly focused on the original research question.
- Treat the original question as the primary objective throughout.
- Research only information relevant to the original question.
- Do not create broad document-summary steps unless explicitly requested.
- Use 3–5 steps only when the question warrants that many; avoid redundant steps.
"""

        user_prompt = f"""
Research question:

{query}
"""

        response = generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        data = json.loads(response)

        return PlannerOutput.model_validate(data)

    