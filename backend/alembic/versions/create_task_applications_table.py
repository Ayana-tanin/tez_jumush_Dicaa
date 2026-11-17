"""Create task_applications table

Revision ID: create_task_applications_001
Revises: add_time_fields_001
Create Date: 2025-01-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_task_applications_001'
down_revision: Union[str, None] = 'add_time_fields_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем таблицу task_applications
    op.create_table('task_applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('worker_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=True, server_default='pending'),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.ForeignKeyConstraint(['worker_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_task_applications_id'), 'task_applications', ['id'], unique=False)
    # Уникальный индекс: один работник может откликнуться на задачу только один раз
    op.create_index('ix_task_applications_task_worker', 'task_applications', ['task_id', 'worker_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_task_applications_task_worker', table_name='task_applications')
    op.drop_index(op.f('ix_task_applications_id'), table_name='task_applications')
    op.drop_table('task_applications')

