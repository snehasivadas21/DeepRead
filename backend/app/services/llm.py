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
                    "You are a research assistant.\n\n"
                    "Answer the user's question using only the "
                    "provided context.\n\n"
                    "Rules:\n"
                    "1. Do not use information that is not in the context.\n"
                    "2. If the context does not contain enough information, "
                    "say that you don't have enough information.\n"
                    "3. When making a factual claim, cite the relevant "
                    "source using [Source N].\n"
                    "4. Only cite sources that are actually provided in "
                    "the context.\n"
                    "5. Do not invent or guess source numbers."
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
    )

    return response.choices[0].message.content