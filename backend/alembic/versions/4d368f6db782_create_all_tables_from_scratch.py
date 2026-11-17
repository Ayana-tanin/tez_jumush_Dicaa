"""Create all tables from scratch

Revision ID: 4d368f6db782
Revises: 
Create Date: 2025-09-07 22:26:09.392522

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d368f6db782'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем таблицу users
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('passport_series', sa.String(), nullable=False),
        sa.Column('passport_number', sa.String(), nullable=False),
        sa.Column('passport_issued_by', sa.String(), nullable=False),
        sa.Column('passport_date', sa.String(), nullable=False),
        sa.Column('passport_front', sa.String(), nullable=True),
        sa.Column('passport_back', sa.String(), nullable=True),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)

    # Создаем таблицу tasks
    op.create_table('tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Integer(), nullable=False),
        sa.Column('count_people', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('time_from', sa.Time(), nullable=False, server_default='08:00:00'),
        sa.Column('time_to', sa.Time(), nullable=False, server_default='17:00:00'),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)

    # Создаем таблицу messages
    op.create_table('messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('receiver_id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'),
        sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_id'), 'messages', ['id'], unique=False)

    # Создаем таблицу sms_verifications
    op.create_table('sms_verifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('attempts', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sms_verifications_id'), 'sms_verifications', ['id'], unique=False)
    op.create_index(op.f('ix_sms_verifications_phone'), 'sms_verifications', ['phone'], unique=False)


def downgrade() -> None:
    # Удаляем таблицы в обратном порядке
    op.drop_index(op.f('ix_sms_verifications_phone'), table_name='sms_verifications')
    op.drop_index(op.f('ix_sms_verifications_id'), table_name='sms_verifications')
    op.drop_table('sms_verifications')
    
    op.drop_index(op.f('ix_messages_id'), table_name='messages')
    op.drop_table('messages')
    
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    op.drop_table('tasks')
    
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
