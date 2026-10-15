from app.agents.planner import PlannerAgent
from app.agents.retrieval import RetrievalAgent


def test_planner_returns_research_steps():
    planner = PlannerAgent()

    result = planner.plan(
        "What are the benefits and risks of AI in healthcare?"
    )

    assert len(result.steps) == 3

    assert result.steps[0].step_number == 1
    assert result.steps[0].question

    assert result.steps[1].step_number == 2
    assert result.steps[1].question

    assert result.steps[2].step_number == 3
    assert result.steps[2].question


def test_retrieval_agent_returns_results(monkeypatch):

    class FakeChunk:
        id = 1
        source_id = 10
        text = "AI can improve healthcare diagnosis."
        
        class Page:
            page_number = 3

        page = Page()

    fake_hybrid_results = [
        {
            "chunk": FakeChunk(),
            "similarity": 0.91,
            "keyword_score": 0.80,
        }
    ]

    fake_reranked_results = [
        {
            "chunk": FakeChunk(),
            "similarity": 0.91,
            "keyword_score": 0.80,
            "rerank_score": 8.5,
        }
    ]

    monkeypatch.setattr(
        "app.agents.retrieval.hybrid_search_chunks",
        lambda **kwargs: fake_hybrid_results,
    )

    monkeypatch.setattr(
        "app.agents.retrieval.rerank_chunks",
        lambda **kwargs: fake_reranked_results,
    )

    agent = RetrievalAgent()

    result = agent.retrieve(
        db=None,
        query="AI in healthcare",
        workspace_id=1,
        top_k=5,
    )

    assert len(result.results) == 1

    retrieved = result.results[0]

    assert retrieved.chunk_id == 1
    assert retrieved.source_id == 10
    assert retrieved.page_number == 3
    assert retrieved.content == "AI can improve healthcare diagnosis."
    assert retrieved.rerank_score == 8.5