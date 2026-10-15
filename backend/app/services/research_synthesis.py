from sqlalchemy.orm import Session

from app.agents.synthesis import SynthesisAgent
from app.models.research import ResearchTask
from app.models.research_evidence import ResearchEvidence
from app.services.citation_validator import validate_citations


def synthesize_research(
    db: Session,
    research_task: ResearchTask,
) -> str:
    analyses = [
        step.analysis
        for step in research_task.steps
        if step.analysis
    ]

    if not analyses:
        research_task.report = (
            "Insufficient analysis was available to generate "
            "a research report."
        )
        db.commit()
        return research_task.report

    evidence_records = (
        db.query(ResearchEvidence)
        .filter(
            ResearchEvidence.research_task_id == research_task.id
        )
        .order_by(ResearchEvidence.id.asc())
        .all()
    )

    evidence = [
        {
            "source_id": item.source_id,
            "page_number": item.page_number,
            "content": item.content,
        }
        for item in evidence_records
    ]

    agent = SynthesisAgent()

    report = agent.synthesize(
        question=research_task.query,
        analyses=analyses,
        evidence=evidence,
    )

    invalid_citations = validate_citations(
        report,
        evidence_records,
    )

    if invalid_citations:
        correction_prompt = (
            "\n\nIMPORTANT: Correct these invalid citations: "
            + ", ".join(invalid_citations)
            + ". Use only the supplied evidence and its exact "
              "source IDs and page numbers. Remove unsupported "
              "citations. Return the complete corrected report."
        )

        report = agent.synthesize(
            question=research_task.query + correction_prompt,
            analyses=analyses,
            evidence=evidence,
        )

        invalid_citations = validate_citations(
            report,
            evidence_records,
        )

    if invalid_citations:
        raise ValueError(
            "Report contains invalid citations after correction: "
            + ", ".join(invalid_citations)
        )

    research_task.report = report
    db.commit()
    db.refresh(research_task)

    return report

