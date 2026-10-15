from app.models.research import ResearchTask
from app.services.research_planner import create_research_steps


def test_create_research_steps(db_session, monkeypatch):
    research_task = ResearchTask(
        user_id=1,
        workspace_id=1,
        query="What are the benefits and risks of AI in healthcare?",
        status="pending",
        current_step=0,
        progress=0,
    )

    db_session.add(research_task)
    db_session.commit()
    db_session.refresh(research_task)

    fake_response = {
        "steps": [
            {
                "step_number": 1,
                "question": "What are the benefits of AI in healthcare?",
            },
            {
                "step_number": 2,
                "question": "What are the risks of AI in healthcare?",
            },
            {
                "step_number": 3,
                "question": "What are the ethical concerns?",
            },
        ]
    }

    class FakePlanner:
        def plan(self, query):
            from app.schemas.planner import PlannerOutput

            return PlannerOutput.model_validate(fake_response)

    monkeypatch.setattr(
        "app.services.research_planner.PlannerAgent",
        FakePlanner,
    )

    steps = create_research_steps(
        db=db_session,
        research_task=research_task,
    )

    assert len(steps) == 3

    assert steps[0].research_task_id == research_task.id
    assert steps[0].step_number == 1
    assert steps[0].status == "pending"

    assert steps[1].step_number == 2
    assert steps[2].step_number == 3

    saved_steps = (
        db_session.query(
            __import__(
                "app.models.research_step",
                fromlist=["ResearchStep"],
            ).ResearchStep
        )
        .filter_by(research_task_id=research_task.id)
        .all()
    )

    assert len(saved_steps) == 3