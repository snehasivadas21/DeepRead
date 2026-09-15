from sqlalchemy.orm import Session

from app.models.chunk_embeddings import ChunkEmbedding
from app.services.embeddings import create_embedding


def search_similar_chunks(
    db: Session,
    query: str,
    top_k: int = 5,
):
    query_embedding = create_embedding(query)

    results = (
        db.query(ChunkEmbedding)
        .order_by(
            ChunkEmbedding.embedding.cosine_distance(query_embedding)
        )
        .limit(top_k)
        .all()
    )

    return results