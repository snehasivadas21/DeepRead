"""add refresh tokens

Revision ID: 37672be4a63c
Revises: d2edb54749a2
Create Date: 2026-09-06 08:26:18.402715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37672be4a63c'
down_revision: Union[str, Sequence[str], None] = 'd2edb54749a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash'),
    )

    op.create_index(
        op.f('ix_refresh_tokens_id'),
        'refresh_tokens',
        ['id'],
        unique=False,
    )

    op.create_index(
        op.f('ix_refresh_tokens_user_id'),
        'refresh_tokens',
        ['user_id'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_refresh_tokens_user_id'),
        table_name='refresh_tokens',
    )
    op.drop_index(
        op.f('ix_refresh_tokens_id'),
        table_name='refresh_tokens',
    )
    op.drop_table('refresh_tokens')