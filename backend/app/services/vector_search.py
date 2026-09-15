from sqlalchemy.orm import Session

from app.models.chunk_embeddings import ChunkEmbedding
from app.models.document_chunks import DocumentChunk

from app.services.embeddings import create_embedding


def search_similar_chunks(db: Session,query: str,workspace_id: int,top_k: int = 5,):
    query_embedding = create_embedding(query)

    distance = ChunkEmbedding.embedding.cosine_distance(query_embedding)

    results = (
        db.query(
            ChunkEmbedding,
            distance.label("distance"),
        )
        .join(
            DocumentChunk,
            DocumentChunk.id == ChunkEmbedding.chunk_id,
        )
        .filter(
            DocumentChunk.source.has(
                workspace_id=workspace_id
            )
        )
        .order_by(distance)
        .limit(top_k)
        .all()
    )

    return [
        {
            "chunk": chunk_embedding.chunk,
            "distance": float(distance_value),
            "similarity": round(1 - float(distance_value), 4),
        }
        for chunk_embedding, distance_value in results
    ]