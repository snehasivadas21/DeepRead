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

    print("\n========== VECTOR SEARCH RESULTS ==========")

    for index, item in enumerate(retrieved_results, start=1):
        chunk = item["chunk"]

        print(
            f"{index}. "
            f"similarity={item['similarity']} "
            f"source_id={chunk.source_id} "
            f"page={chunk.page.page_number}"
        )

        print(chunk.text[:300])
        print("------------------------------------------")

    print("===========================================\n")

    results = rerank_chunks(
        query=query,
        results=retrieved_results,
        top_k=top_k
    )

    print("\n========== RERANKED RESULTS ==========")

    for index, item in enumerate(results, start=1):
        chunk = item["chunk"]

        print(
            f"{index}. "
            f"similarity={item['similarity']} "
            f"rerank_score={item['rerank_score']} "
            f"source_id={chunk.source_id} "
            f"page={chunk.page.page_number}"
        )

        print(chunk.text[:300])
        print("------------------------------------")

    print("======================================\n")

    context_parts = []
    citations = []

    for index, item in enumerate(results, start=1):
        chunk = item["chunk"]

        context_parts.append(
            f"[Source {index} | Page {chunk.page.page_number}]\n"
            f"{chunk.text}"
        )

        citations.append({
            "citation_id": index,
            "source_id": chunk.source_id,
            "source_name": chunk.source.file_url.split("/")[-1],
            "page_number": chunk.page.page_number,
            "chunk_id": chunk.id,
        })

    context = "\n\n".join(context_parts)

    print("\n========== RAG CONTEXT ==========")
    print(context)
    print("\n========== USER QUESTION ==========")
    print(query)
    print("===================================\n")

    answer = generate_answer(
        context=context,
        question=query,
    )

    return {
        "answer": answer,
        "citations": citations,
    }