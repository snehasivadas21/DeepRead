from sqlalchemy.orm import Session

from app.models.research import ResearchTask
from app.models.research_evidence import ResearchEvidence
from app.models.research_step import ResearchStep
from app.agents.retrieval import RetrievalAgent


def collect_research_evidence(
    db: Session,
    research_task: ResearchTask,
    research_step: ResearchStep,
) -> list[ResearchEvidence]:

    retrieval_agent = RetrievalAgent()

    retrieval_output = retrieval_agent.retrieve(
        db=db,
        query=research_step.question,
        workspace_id=research_task.workspace_id,
        top_k=5,
    )

    evidence_list = []

    for result in retrieval_output.results:

        evidence = ResearchEvidence(
            research_task_id=research_task.id,
            step_id=research_step.id,
            source_id=result.source_id,
            chunk_id=result.chunk_id,
            content=result.content,
            page_number=result.page_number,
            relevance_score=result.rerank_score,
        )

        db.add(evidence)
        evidence_list.append(evidence)

    db.commit()

    for evidence in evidence_list:
        db.refresh(evidence)

    return evidence_list