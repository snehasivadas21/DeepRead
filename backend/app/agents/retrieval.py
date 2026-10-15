from sqlalchemy.orm import Session

from app.schemas.retrieval import RetrievalOutput, RetrievalResult
from app.services.hybrid_search import hybrid_search_chunks
from app.services.reranker import rerank_chunks


class RetrievalAgent:

    def retrieve(
        self,
        db: Session,
        query: str,
        workspace_id: int,
        top_k: int = 5,
    ) -> RetrievalOutput:

        # 1. Existing RAG retrieval
        hybrid_results = hybrid_search_chunks(
            db=db,
            query=query,
            workspace_id=workspace_id,
            top_k=20,
        )

        # 2. Existing reranking
        ranked_results = rerank_chunks(
            query=query,
            results=hybrid_results,
            top_k=top_k,
        )

        # 3. Convert database results into agent output
        results = []

        for item in ranked_results:
            chunk = item["chunk"]

            results.append(
                RetrievalResult(
                    chunk_id=chunk.id,
                    source_id=chunk.source_id,
                    page_number=(
                        chunk.page.page_number
                        if chunk.page
                        else None
                    ),
                    content=chunk.text,
                    rerank_score=item["rerank_score"],
                )
            )

        return RetrievalOutput(results=results)