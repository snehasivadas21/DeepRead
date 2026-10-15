
from sqlalchemy.orm import Session

from app.models.research import ResearchTask
from app.models.research_step import ResearchStep
from app.services.research_evidence import collect_research_evidence
from app.services.research_analysis import analyze_research_step


def process_research_step(
    db: Session,
    research_task: ResearchTask,
    research_step: ResearchStep,
):
    research_step.status = "researching"
    db.commit()

    try:
        evidence = collect_research_evidence(
            db=db,
            research_task=research_task,
            research_step=research_step,
        )

        analysis = analyze_research_step(
            db=db,
            research_step=research_step,
        )

        research_step.status = "completed"
        research_step.result = (
            f"Retrieved {len(evidence)} evidence items."
        )

        db.commit()
        db.refresh(research_step)

        return {
            "evidence": evidence,
            "analysis": analysis,
        }

    except Exception:
        research_step.status = "failed"
        db.commit()
        raise