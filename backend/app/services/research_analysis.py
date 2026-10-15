from sqlalchemy.orm import Session

from app.agents.analysis import AnalysisAgent
from app.models.research_step import ResearchStep
from app.models.research_evidence import ResearchEvidence
from app.schemas.retrieval import RetrievalOutput, RetrievalResult


def analyze_research_step(
    db: Session,
    research_step: ResearchStep,
) -> str:

    evidence_records = (
        db.query(ResearchEvidence)
        .filter(
            ResearchEvidence.step_id == research_step.id
        )
        .all()
    )

    retrieval_output = RetrievalOutput(
        results=[
            RetrievalResult(
                chunk_id=item.chunk_id,
                source_id=item.source_id,
                page_number=item.page_number,
                content=item.content,
                rerank_score=item.relevance_score,
            )
            for item in evidence_records
        ]
    )

    if not retrieval_output.results:
        research_step.analysis = (
            "Insufficient evidence was retrieved to analyze this question."
        )
        db.commit()
        return research_step.analysis

    agent = AnalysisAgent()

    analysis = agent.analyze(
        question=research_step.question,
        evidence=retrieval_output,
    )

    research_step.analysis = analysis

    db.commit()
    db.refresh(research_step)

    return analysis