from app.models.research import ResearchTask
from app.models.research_step import ResearchStep
from app.models.research_evidence import ResearchEvidence
from app.services.research_analysis import analyze_research_step


def test_analyze_research_step(db_session, monkeypatch):
    # Arrange: create a research task
    task = ResearchTask(
        user_id=1,
        workspace_id=1,
        query="Privacy risks of AI in healthcare",
        status="researching",
    )
    db_session.add(task)
    db_session.flush()

    # Create a research step
    step = ResearchStep(
        research_task_id=task.id,
        step_number=1,
        question="What are the privacy risks?",
        status="researching",
    )
    db_session.add(step)
    db_session.flush()

    # Create supporting evidence
    evidence = ResearchEvidence(
        research_task_id=task.id,
        step_id=step.id,
        source_id=1,
        chunk_id=1,
        content="AI systems may expose sensitive patient data.",
        page_number=5,
        relevance_score=8.5,
    )
    db_session.add(evidence)
    db_session.flush()

    # Mock the LLM-facing agent
    def fake_analyze(self, question, evidence):
        assert question == "What are the privacy risks?"
        assert len(evidence.results) == 1
        assert "sensitive patient data" in evidence.results[0].content
        return "The evidence identifies patient-data exposure as a privacy risk."

    monkeypatch.setattr(
        "app.services.research_analysis.AnalysisAgent.analyze",
        fake_analyze,
    )

    # Act
    result = analyze_research_step(
        db=db_session,
        research_step=step,
    )

    # Assert
    assert result == (
        "The evidence identifies patient-data exposure as a privacy risk."
    )

    db_session.refresh(step)
    assert step.analysis == result