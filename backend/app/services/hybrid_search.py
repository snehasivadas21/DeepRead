from sqlalchemy.orm import Session

from app.services.vector_search import search_similar_chunks
from app.services.keyword_search import search_keyword_chunks


def hybrid_search_chunks(
    db: Session,
    query: str,
    workspace_id: int,
    top_k: int = 20,
    source_id: int | None = None,
    page_number: int | None = None,
):
    vector_results = search_similar_chunks(
        db=db,
        query=query,
        workspace_id=workspace_id,
        top_k=top_k,
        source_id=source_id,
        page_number=page_number,
    )

    keyword_results = search_keyword_chunks(
        db=db,
        query=query,
        workspace_id=workspace_id,
        top_k=top_k,
        source_id=source_id,
        page_number=page_number,
    )

    combined = {}

    for result in vector_results:
        chunk_id = result["chunk"].id

        combined[chunk_id] = {
            **result,
            "keyword_score": 0.0,
        }

    for result in keyword_results:
        chunk_id = result["chunk"].id

        if chunk_id in combined:
            combined[chunk_id]["keyword_score"] = result["keyword_score"]
        else:
            combined[chunk_id] = {
                **result,
                "similarity": 0.0,
                "keyword_score": result["keyword_score"],
            }

    return list(combined.values())