import re


CITATION_PATTERN = re.compile(
    r"\[Source\s+(\d+)"
    r"(?:\s*,\s*p\.\s*(\d+))?\]"
)


def validate_citations(
    report: str,
    evidence: list,
) -> list[str]:
    """
    Return citations that don't match the supplied evidence.
    """

    valid_citations = set()

    for item in evidence:
        source_id = item.source_id
        page_number = item.page_number

        valid_citations.add((source_id, page_number))

    invalid_citations = []

    for match in CITATION_PATTERN.finditer(report):
        source_id = int(match.group(1))
        page_text = match.group(2)

        if page_text is None:
            source_exists = any(
                sid == source_id
                for sid, _ in valid_citations
            )

            if not source_exists:
                invalid_citations.append(match.group(0))

            continue

        page_number = int(page_text)

        if (source_id, page_number) not in valid_citations:
            invalid_citations.append(match.group(0))

    return invalid_citations
