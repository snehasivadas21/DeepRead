from sqlalchemy.orm import Session

from app.models.research import ResearchTask
from app.services.research_step import process_research_step


def run_research(
    db: Session,
    research_task: ResearchTask,
):
    research_task.status = "researching"
    db.commit()

    steps = (
        research_task.steps
    )

    try:
        for index, step in enumerate(steps, start=1):

            research_task.current_step = index
            research_task.progress = int(
                ((index - 1) / len(steps)) * 100
            )
            db.commit()

            process_research_step(
                db=db,
                research_task=research_task,
                research_step=step,
            )

        research_task.current_step = len(steps)
        research_task.progress = 100
        research_task.status = "completed"

        db.commit()
        db.refresh(research_task)

        return research_task

    except Exception:
        research_task.status = "failed"
        db.commit()
        raise