from app.worker.celery_app import celery_app

import fitz

from app.db.session import SessionLocal

from app.models.sources import Source
from app.models.source_pages import SourcePage
from app.models.document_chunks import DocumentChunk
from app.models.chunk_embeddings import ChunkEmbedding

from app.services.embeddings import (create_embedding,EMBEDDING_MODEL)
from app.services.email import send_verification_email, send_password_reset_email
from app.services.chunking import chunk_text

@celery_app.task
def send_verification_email_task(recipient: str,verification_url: str) -> None:
    
    send_verification_email(recipient=recipient,verification_url=verification_url),

@celery_app.task
def send_password_reset_email_task(recipient: str,reset_url: str) -> None:

    send_password_reset_email(recipient=recipient,reset_url=reset_url)

@celery_app.task
def process_source(source_id: int):
    db = SessionLocal()

    try:
        source = db.query(Source).filter(Source.id == source_id).first()

        if not source:
            return {"status": "failed", "message": "Source not found"}

        source.status = "processing"
        db.query(DocumentChunk).filter(
            DocumentChunk.source_id == source.id
        ).delete()

        db.query(SourcePage).filter(
            SourcePage.source_id == source.id
        ).delete()

        db.commit()

        pdf = fitz.open(source.file_url)

        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text")

            source_page = SourcePage(
                source_id=source.id,
                page_number=page_number,
                text=text,
            )

            db.add(source_page)
            db.flush()

            chunks = chunk_text(text)

            for chunk_index, chunk in enumerate(chunks):
                document_chunk = DocumentChunk(
                    source_id=source.id,
                    page_id=source_page.id,
                    chunk_index=chunk_index,
                    text=chunk,
                )

                db.add(document_chunk)

        pdf.close()

        source.status = "ready"
        db.commit()

        return {
            "status": "ready",
            "source_id": source.id,
        }

    except Exception:
        db.rollback()

        source = db.query(Source).filter(Source.id == source_id).first()

        if source:
            source.status = "failed"
            db.commit()

        raise

    finally:
        db.close()

@celery_app.task
def embed_source_chunks(source_id: int):
    db = SessionLocal()

    try:
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.source_id == source_id)
            .all()
        )

        embedded_count = 0

        for chunk in chunks:
            existing = (
                db.query(ChunkEmbedding)
                .filter(ChunkEmbedding.chunk_id == chunk.id)
                .first()
            )

            if existing:
                continue

            embedding = create_embedding(chunk.text)

            chunk_embedding = ChunkEmbedding(
                chunk_id=chunk.id,
                model=EMBEDDING_MODEL,
                embedding=embedding,
            )

            db.add(chunk_embedding)
            embedded_count += 1

        db.commit()

        return {
            "status": "completed",
            "source_id": source_id,
            "embedded_count": embedded_count,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()