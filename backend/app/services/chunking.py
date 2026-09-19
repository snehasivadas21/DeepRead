def chunk_text(text: str,chunk_size: int = 800,overlap: int = 100,) -> list[str]:
    text = text.strip()

    print("\n========== TEXT BEFORE CHUNKING ==========")
    print(text[:3000])
    print("==========================================\n")

    if not text:
        return []

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    chunks = []
    current_chunk = []

    for paragraph in paragraphs:
        current_text = "\n\n".join(current_chunk)

        if (current_chunk and len(current_text) + len(paragraph) + 2 <= chunk_size):

            current_chunk.append(paragraph)
            continue

        if current_chunk:
            chunks.append("\n\n".join(current_chunk))
        current_chunk = [paragraph]

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
    return chunks        