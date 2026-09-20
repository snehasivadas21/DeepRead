from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.document_chunks import DocumentChunk


def search_keyword_chunks(
    db: Session,
    query: str,
    workspace_id: int,
    top_k: int = 20,
    source_id: int | None = None,
    page_number: int | None = None,
):
    search_vector = func.to_tsvector(
        "english",
        DocumentChunk.text,
    )

    search_query = func.plainto_tsquery(
        "english",
        query,
    )

    filters = [
        DocumentChunk.source.has(
            workspace_id=workspace_id
        ),
        search_vector.op("@@")(search_query),
    ]

    if source_id is not None:
        filters.append(
            DocumentChunk.source_id == source_id
        )

    if page_number is not None:
        filters.append(
            DocumentChunk.page.has(
                page_number=page_number
            )
        )

    results = (
        db.query(
            DocumentChunk,
            func.ts_rank(
                search_vector,
                search_query,
            ).label("keyword_score"),
        )
        .filter(*filters)
        .order_by(
            func.ts_rank(
                search_vector,
                search_query,
            ).desc()
        )
        .limit(top_k)
        .all()
    )

    return [
        {
            "chunk": chunk,
            "keyword_score": float(score),
        }
        for chunk, score in results
    ]