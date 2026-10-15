from app.services.llm import generate_text


class SynthesisAgent:
    def synthesize(
        self,
        question: str,
        analyses: list[str],
        evidence: list[dict],
    ) -> str:

        analysis_text = "\n\n".join(
            [
                f"Analysis {index + 1}:\n{analysis}"
                for index, analysis in enumerate(analyses)
            ]
        )

        evidence_text = "\n\n".join(
            [
                (
                    f"[Source {item['source_id']}, "
                    f"p. {item['page_number']}]\n"
                    f"{item['content']}"
                )
                for item in evidence
            ]
        )

        system_prompt = """
You are a research synthesis agent.

Write a coherent report answering the research question.

Rules:
- Use only the supplied analyses and evidence.
- Do not invent facts or citations.
- Support factual claims with citations in this format:
  [Source ID, p. PAGE_NUMBER]
- Use the exact source IDs and page numbers provided.
- If a page number is unavailable, cite [Source ID].
- Do not add unsupported claims.
- Use clear Markdown headings.
"""

        user_prompt = f"""
Research question:
{question}

Research analyses:
{analysis_text}

Source evidence:
{evidence_text}

Write the final research report with citations.
"""

        return generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
