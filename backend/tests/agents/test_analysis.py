from app.agents.analysis import AnalysisAgent
from app.schemas.retrieval import RetrievalOutput, RetrievalResult


def test_analysis_agent(monkeypatch):

    fake_response = (
        "The evidence indicates that AI systems can create "
        "privacy risks when handling sensitive patient data."
    )

    def fake_generate_text(system_prompt, user_prompt):
        assert "research question" in user_prompt.lower()
        assert "patient data" in user_prompt.lower()

        return fake_response

    monkeypatch.setattr(
        "app.agents.analysis.generate_text",
        fake_generate_text,
    )

    evidence = RetrievalOutput(
        results=[
            RetrievalResult(
                chunk_id=1,
                source_id=10,
                page_number=5,
                content=(
                    "AI systems process large amounts "
                    "of patient data."
                ),
                rerank_score=8.5,
            ),
            RetrievalResult(
                chunk_id=2,
                source_id=11,
                page_number=12,
                content=(
                    "Unauthorized access can expose "
                    "sensitive information."
                ),
                rerank_score=7.9,
            ),
        ]
    )

    agent = AnalysisAgent()

    result = agent.analyze(
        question="What are the privacy risks of AI in healthcare?",
        evidence=evidence,
    )

    assert result == fake_response