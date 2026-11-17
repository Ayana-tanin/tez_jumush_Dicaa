"""Create chats table and update messages table

Revision ID: create_chats_001
Revises: update_messages_001
Create Date: 2025-01-15 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'create_chats_001'
down_revision: Union[str, None] = 'update_messages_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Создаем таблицу chats
    op.create_table('chats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=True),
        sa.Column('employer_id', sa.Integer(), nullable=False),
        sa.Column('worker_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.ForeignKeyConstraint(['application_id'], ['task_applications.id'], ),
        sa.ForeignKeyConstraint(['employer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['worker_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('task_id', 'application_id', 'employer_id', 'worker_id', name='uq_chat_task_app_users')
    )
    op.create_index(op.f('ix_chats_id'), 'chats', ['id'], unique=False)
    
    # Проверяем текущее состояние таблицы messages
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = {col['name']: col for col in inspector.get_columns('messages')}
    
    # Переименовываем content в text (если поле content существует)
    if 'content' in columns and 'text' not in columns:
        op.alter_column('messages', 'content', new_column_name='text')
    elif 'text' not in columns:
        # Если нет ни content, ни text, создаем text
        op.add_column('messages', sa.Column('text', sa.Text(), nullable=True))
    
    # Переименовываем timestamp в created_at (если существует)
    if 'timestamp' in columns and 'created_at' not in columns:
        op.alter_column('messages', 'timestamp', new_column_name='created_at')
    elif 'created_at' not in columns:
        op.add_column('messages', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    
    # Убеждаемся, что is_read существует
    if 'is_read' not in columns:
        op.add_column('messages', sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'))
    
    # Добавляем chat_id (обязательное поле для новых сообщений)
    if 'chat_id' not in columns:
        # Удаляем старые сообщения (как указано в требованиях - старые можно не переносить)
        op.execute("DELETE FROM messages")
        
        # Добавляем chat_id как обязательное поле
        op.add_column('messages', sa.Column('chat_id', sa.Integer(), nullable=False))
        op.create_foreign_key('fk_messages_chat_id', 'messages', 'chats', ['chat_id'], ['id'])
    
    # Удаляем старые поля task_id, receiver_id и application_id (больше не нужны)
    # Проверяем существование constraint перед удалением
    if 'task_id' in columns:
        # Получаем список всех foreign key constraints
        try:
            fk_constraints = [fk['name'] for fk in inspector.get_foreign_keys('messages')]
            # Ищем constraint для task_id (может иметь разные имена)
            for fk in inspector.get_foreign_keys('messages'):
                if 'task_id' in [col['name'] for col in fk.get('constrained_columns', [])]:
                    op.drop_constraint(fk['name'], 'messages', type_='foreignkey')
                    break
        except:
            pass  # Если не удалось найти constraint, продолжаем
        op.drop_column('messages', 'task_id')
    if 'receiver_id' in columns:
        try:
            for fk in inspector.get_foreign_keys('messages'):
                if 'receiver_id' in [col['name'] for col in fk.get('constrained_columns', [])]:
                    op.drop_constraint(fk['name'], 'messages', type_='foreignkey')
                    break
        except:
            pass
        op.drop_column('messages', 'receiver_id')
    if 'application_id' in columns:
        try:
            fk_constraints = [fk['name'] for fk in inspector.get_foreign_keys('messages')]
            # Ищем constraint для application_id
            for fk in inspector.get_foreign_keys('messages'):
                if 'application_id' in [col['name'] for col in fk.get('constrained_columns', [])]:
                    op.drop_constraint(fk['name'], 'messages', type_='foreignkey')
                    break
        except:
            pass
        op.drop_column('messages', 'application_id')


def downgrade() -> None:
    # Удаляем внешний ключ и колонку chat_id
    op.drop_constraint('fk_messages_chat_id', 'messages', type_='foreignkey')
    op.drop_column('messages', 'chat_id')
    
    # Восстанавливаем старые поля если нужно
    # op.add_column('messages', sa.Column('task_id', sa.Integer(), nullable=True))
    # op.add_column('messages', sa.Column('application_id', sa.Integer(), nullable=True))
    
    # Удаляем таблицу chats
    op.drop_index(op.f('ix_chats_id'), table_name='chats')
    op.drop_table('chats')

