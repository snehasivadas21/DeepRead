from types import SimpleNamespace

from app.services.research_step import process_research_step


def test_process_research_step(db_session, monkeypatch):
    research_task = SimpleNamespace(
        id=1,
        workspace_id=10,
    )

    research_step = SimpleNamespace(
        id=1,
        question="What are the privacy risks of AI?",
        status="pending",
        result=None,
    )

    fake_evidence = [
        SimpleNamespace(id=1),
        SimpleNamespace(id=2),
        SimpleNamespace(id=3),
    ]

    def fake_collect_research_evidence(
        db,
        research_task,
        research_step,
    ):
        return fake_evidence

    monkeypatch.setattr(
        "app.services.research_step.collect_research_evidence",
        fake_collect_research_evidence,
    )

    result = process_research_step(
        db=db_session,
        research_task=research_task,
        research_step=research_step,
    )

    assert result == fake_evidence
    assert research_step.status == "completed"
    assert research_step.result == "Retrieved 3 evidence items."