from app.models.research import ResearchTask
from app.models.research_step import ResearchStep
from app.services.research_synthesis import synthesize_research


def test_synthesize_research(db_session, monkeypatch):

    task = ResearchTask(
        user_id=1,
        workspace_id=1,
        query="What are the risks of AI in healthcare?",
        status="analyzing",
    )

    db_session.add(task)
    db_session.flush()

    step_one = ResearchStep(
        research_task_id=task.id,
        step_number=1,
        question="What are the privacy risks?",
        status="completed",
        analysis="AI systems can expose sensitive patient data.",
    )

    step_two = ResearchStep(
        research_task_id=task.id,
        step_number=2,
        question="What are the security risks?",
        status="completed",
        analysis="Unauthorized access can expose patient information.",
    )

    db_session.add_all([step_one, step_two])
    db_session.flush()

    fake_report = (
        "# Research Report\n\n"
        "AI healthcare systems present privacy and security risks."
    )

    def fake_synthesize(self, question, analyses):
        assert question == "What are the risks of AI in healthcare?"
        assert len(analyses) == 2
        assert "privacy" in analyses[0].lower()
        assert "security" in analyses[1].lower()

        return fake_report

    monkeypatch.setattr(
        "app.services.research_synthesis.SynthesisAgent.synthesize",
        fake_synthesize,
    )

    result = synthesize_research(
        db=db_session,
        research_task=task,
    )

    assert result == fake_report

    db_session.refresh(task)

    assert task.report == fake_report