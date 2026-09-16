from sqlalchemy.orm import Session

from app.services.vector_search import search_similar_chunks
from app.services.llm import generate_answer
from app.services.reranker import rerank_chunks


def answer_question(db: Session,query: str,workspace_id: int,top_k: int = 5,):
    retrieved_results = search_similar_chunks(
        db=db,
        query=query,
        workspace_id=workspace_id,
        top_k=20,
    )

    results = rerank_chunks(
        query=query,
        results=retrieved_results,
        top_k=top_k
    )

    context_parts = []
    citations = []

    for index, item in enumerate(results, start=1):
        chunk = item["chunk"]

        context_parts.append(
            f"[Source {index}]\n{chunk.text}"
        )

        citations.append({
            "source": index,
            "chunk_id": chunk.id,
            "source_id": chunk.source_id,
            "page_number": chunk.page.page_number,
            "similarity": item["similarity"],
        })

    context = "\n\n".join(context_parts)

    answer = generate_answer(
        context=context,
        question=query,
    )

    return {
        "answer": answer,
        "citations": citations,
    }