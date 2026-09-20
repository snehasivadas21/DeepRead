from openai import OpenAI

from app.core.config import settings


client = OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url=settings.OPENROUTER_BASE_URL,
)


def generate_answer(context: str,question: str,) -> str:

    response = client.chat.completions.create(
        model=settings.OPENROUTER_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                "You are a research assistant that answers questions strictly from "
                "the provided document context.\n\n"

                "IMPORTANT:\n"
                "The provided context is the only source of truth.\n"
                "Do not use your general knowledge, assumptions, typical practices, "
                "or outside information to answer the question.\n\n"

                "Rules:\n"
                "1. Answer only from information explicitly present in the context.\n"
                "2. If the answer is not explicitly supported by the context, say "
                "\"The provided documents do not specify this.\"\n"
                "3. Never fill missing information using assumptions or common practices.\n"
                "4. Never recommend or guess an answer when the documents do not provide one.\n"
                "5. Answer the user's question directly and concisely.\n"
                "6. Do not summarize unrelated information from the context.\n"
                "7. Use Markdown when it improves readability.\n"
                "8. Use bullet points or numbered lists when appropriate.\n"
                "9. Cite factual claims using [Source N].\n"
                "10. Only use source numbers that exist in the provided context.\n"
                "11. If multiple sources support a claim, cite all relevant sources.\n"
                "12. Do not create a Sources section; citations are handled separately.\n"
            )
            },
            {
                "role": "user",
                "content": f"""
Context:

{context}

Question:

{question}
""",
            },
        ],
    )

    return response.choices[0].message.content

def stream_answer(context: str, question: str):
    response = client.chat.completions.create(
        model=settings.OPENROUTER_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a research assistant that answers questions strictly from "
                    "the provided document context.\n\n"

                    "IMPORTANT:\n"
                    "The provided context is the only source of truth.\n"
                    "Do not use your general knowledge, assumptions, typical practices, "
                    "or outside information to answer the question.\n\n"

                    "Rules:\n"
                    "1. Answer only from information explicitly present in the context.\n"
                    "2. If the answer is not explicitly supported by the context, say "
                    "\"The provided documents do not specify this.\"\n"
                    "3. Never fill missing information using assumptions or common practices.\n"
                    "4. Never recommend or guess an answer when the documents do not provide one.\n"
                    "5. Answer the user's question directly and concisely.\n"
                    "6. Do not summarize unrelated information from the context.\n"
                    "7. Use Markdown when it improves readability.\n"
                    "8. Use bullet points or numbered lists when appropriate.\n"
                    "9. Cite factual claims using [Source N].\n"
                    "10. Only use source numbers that exist in the provided context.\n"
                    "11. If multiple sources support a claim, cite all relevant sources.\n"
                    "12. Do not create a Sources section; citations are handled separately.\n"
                ),
            },
            {
                "role": "user",
                "content": f"""
Context:

{context}

Question:

{question}
""",
            },
        ],
        stream=True,
    )

    for chunk in response:
        content = chunk.choices[0].delta.content

        if content:
            yield content