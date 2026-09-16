from sentence_transformers import CrossEncoder


RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

reranker = CrossEncoder(RERANKER_MODEL)


def rerank_chunks(
    query: str,
    results: list[dict],
    top_k: int = 5,
) -> list[dict]:

    pairs = [
        (query, item["chunk"].text)
        for item in results
    ]

    scores = reranker.predict(pairs)

    ranked_results = []

    for item, score in zip(results, scores):
        ranked_results.append(
            {
                **item,
                "rerank_score": float(score),
            }
        )

    ranked_results.sort(
        key=lambda item: item["rerank_score"],
        reverse=True,
    )

    return ranked_results[:top_k]