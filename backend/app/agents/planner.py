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
- Create 3 to 5 research steps.
- Each question must be specific and useful for research.
- Do not answer the questions.
- Do not include markdown.
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

    