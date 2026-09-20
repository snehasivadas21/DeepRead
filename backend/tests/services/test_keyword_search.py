from app.services.keyword_search import search_keyword_chunks


def test_keyword_search(db_session):
    results = search_keyword_chunks(
        db=db_session,
        query="screening",
        workspace_id=2,
        top_k=5,
    )

    assert isinstance(results, list)

    for result in results:
        assert "chunk" in result
        assert "keyword_score" in result
        assert result["keyword_score"] >= 0