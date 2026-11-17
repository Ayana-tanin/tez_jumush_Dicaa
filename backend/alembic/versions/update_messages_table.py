"""Update messages table: rename timestamp to created_at, add application_id

Revision ID: update_messages_001
Revises: create_task_applications_001
Create Date: 2025-01-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'update_messages_001'
down_revision: Union[str, None] = 'create_task_applications_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Проверяем существование колонок
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('messages')]
    
    # Переименовываем content в text (если поле content существует)
    if 'content' in columns and 'text' not in columns:
        op.alter_column('messages', 'content', new_column_name='text')
    elif 'text' not in columns:
        # Если нет ни content, ни text, создаем text
        op.add_column('messages', sa.Column('text', sa.Text(), nullable=True))
    
    # Переименовываем timestamp в created_at (если поле timestamp существует)
    if 'timestamp' in columns and 'created_at' not in columns:
        op.alter_column('messages', 'timestamp', new_column_name='created_at')
    elif 'created_at' not in columns:
        # Если нет ни timestamp, ни created_at, создаем created_at
        op.add_column('messages', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    
    # Убеждаемся, что поле is_read существует (если его нет)
    if 'is_read' not in columns:
        op.add_column('messages', 
            sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false')
        )


def downgrade() -> None:
    # Переименовываем created_at обратно в timestamp
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('messages')]
    
    if 'created_at' in columns:
        op.alter_column('messages', 'created_at', new_column_name='timestamp')
    
    # Переименовываем text обратно в content (если нужно)
    if 'text' in columns and 'content' not in columns:
        op.alter_column('messages', 'text', new_column_name='content')
    
    # Удаляем is_read если был добавлен
    if 'is_read' in columns:
        op.drop_column('messages', 'is_read')

