"""add document chunk full text search index

Revision ID: 39e2179966b4
Revises: 0e8d1c41b5a0
Create Date: 2026-09-19 11:39:30.861621

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39e2179966b4'
down_revision: Union[str, Sequence[str], None] = '0e8d1c41b5a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE INDEX ix_document_chunks_text_search
        ON document_chunks
        USING GIN (to_tsvector('english', text))
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS ix_document_chunks_text_search
        """
    )