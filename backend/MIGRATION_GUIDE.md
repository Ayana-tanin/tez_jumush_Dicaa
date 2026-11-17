# 📋 Руководство по применению миграций

## Шаг 1: Проверка подключения к БД

Убедитесь, что:
- PostgreSQL запущен
- База данных `tez_jumush_app` существует
- В `config.py` или `.env` указан правильный `DATABASE_URL`

## Шаг 2: Проверка текущего состояния миграций

```bash
cd AppTezJumush/backend
python -m alembic current
```

Эта команда покажет текущую версию миграции в БД.

## Шаг 3: Просмотр истории миграций

```bash
python -m alembic history
```

Покажет все доступные миграции в порядке применения.

## Шаг 4: Применение всех миграций

```bash
python -m alembic upgrade head
```

Эта команда применит все миграции до последней версии.

## Шаг 5: Проверка результата

```bash
python -m alembic current
```

Должна показать последнюю версию: `create_chats_001`

---

## Порядок миграций (последовательность):

1. `4d368f6db782` - создание всех таблиц с нуля
2. `add_time_fields_001` - добавление полей time_from и time_to в tasks
3. `create_task_applications_001` - создание таблицы task_applications
4. `update_messages_001` - исправление messages (content→text, timestamp→created_at, добавление is_read)
5. `create_chats_001` - создание таблицы chats и обновление messages (удаление task_id, receiver_id, добавление chat_id)

---

## Откат миграций (если нужно)

### Откат на одну версию назад:
```bash
python -m alembic downgrade -1
```

### Откат до конкретной версии:
```bash
python -m alembic downgrade <revision_id>
```

### Откат всех миграций:
```bash
python -m alembic downgrade base
```

---

## Важные замечания

⚠️ **ВНИМАНИЕ**: Миграция `create_chats_001` удаляет все старые сообщения из таблицы `messages` перед добавлением поля `chat_id` (как указано в требованиях - старые сообщения можно не переносить).

⚠️ **Перед применением в production**: 
- Сделайте резервную копию БД
- Проверьте миграции на тестовой БД
- Убедитесь, что все зависимости установлены

---

## Проверка структуры таблиц после миграции

После применения миграций проверьте структуру:

```sql
-- Проверка таблицы chats
SELECT * FROM chats LIMIT 5;

-- Проверка таблицы task_applications
SELECT * FROM task_applications LIMIT 5;

-- Проверка структуры messages
\d messages

-- Проверка constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name IN ('chats', 'task_applications', 'messages');
```

---

## Если возникли проблемы

### Ошибка подключения к БД:
- Проверьте `DATABASE_URL` в `config.py` или `.env`
- Убедитесь, что PostgreSQL запущен
- Проверьте права доступа к БД

### Конфликт миграций:
```bash
# Просмотр текущего состояния
python -m alembic current

# Просмотр истории
python -m alembic history

# Применение конкретной миграции
python -m alembic upgrade <revision_id>
```

### Откат и повторное применение:
```bash
# Откат до начала
python -m alembic downgrade base

# Применение заново
python -m alembic upgrade head
```

