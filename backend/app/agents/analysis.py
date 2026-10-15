from app.schemas.retrieval import RetrievalOutput
from app.services.llm import generate_text


class AnalysisAgent:

    def analyze(
        self,
        question: str,
        evidence: RetrievalOutput,
    ) -> str:

        evidence_text = "\n\n".join(
            [
                (
                    f"Evidence {index + 1}:\n"
                    f"Source ID: {item.source_id}\n"
                    f"Page: {item.page_number}\n"
                    f"Content: {item.content}"
                )
                for index, item in enumerate(evidence.results)
            ]
        )

        system_prompt = """
You are a research analysis agent.

Your job is to analyze the provided evidence
in relation to the research question.

Rules:
- Use only the provided evidence.
- Do not use outside knowledge.
- Do not invent facts.
- Identify the important findings from the evidence.
- Explain relationships, patterns, similarities, or differences
  when they are supported by the evidence.
- Clearly distinguish evidence from interpretation.
- If the evidence is insufficient, say so.
- Do not write the final research report.
- Do not add a references section.
"""

        user_prompt = f"""
Research question:

{question}

Evidence:

{evidence_text}

Analyze the evidence and explain the key findings
relevant to the research question.
"""

        return generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )