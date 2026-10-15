from sqlalchemy.orm import Session

from app.agents.planner import PlannerAgent
from app.models.research import ResearchTask
from app.models.research_step import ResearchStep


def create_research_steps(
    db: Session,
    research_task: ResearchTask,
) -> list[ResearchStep]:

    try:
        research_task.status = "planning"
        db.commit()

        planner = PlannerAgent()
        plan = planner.plan(research_task.query)

        steps = []

        for planned_step in plan.steps:
            step = ResearchStep(
                research_task_id=research_task.id,
                step_number=planned_step.step_number,
                question=planned_step.question,
                status="pending",
            )

            db.add(step)
            steps.append(step)

        research_task.status = "researching"
        research_task.current_step = 0
        research_task.progress = 0

        db.commit()

        for step in steps:
            db.refresh(step)

        return steps

    except Exception:
        research_task.status = "failed"
        db.commit()
        raise