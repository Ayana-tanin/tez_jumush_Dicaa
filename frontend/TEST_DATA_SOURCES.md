# 📊 Источники тестовых данных

## 💬 Чаты

### 1. Список чатов (`ChatsScreen.js`)
**Файл:** `src/screens/Chats/ChatsScreen.js`  
**Строка:** 200  
**Данные:** `MOCK_CHATS`

```javascript
const MOCK_CHATS = [
  { id: '1', title: 'Посадка картофеля', subtitle: 'Здравствуйте!', time: '11:30', userName: 'Алексей М.' },
  { id: '2', title: 'Помощь с переездом', subtitle: 'Добрый день', time: '10:15', userName: 'Мария К.' },
  // ...
];
```

### 2. Начальные сообщения в чате (`ChatScreen.js`)
**Файл:** `src/screens/Chats/ChatScreen.js`  
**Строка:** 46  
**Данные:** `initialMessages`

```javascript
const initialMessages = [
  { id: '1', text: 'Здравствуйте!', me: false, timestamp: ..., isRead: false },
  { id: '2', text: 'Добрый день', me: true, timestamp: ..., isRead: true },
  // ...
];
```

## 📋 Задачи

### 1. Все задачи (`TasksContext.js`)
**Файл:** `src/context/TasksContext.js`  
**Строка:** 11  
**Данные:** `initialAllTasks`

```javascript
const initialAllTasks = [
  {
    id: 1,
    title: 'Уборка квартиры',
    price: 5000,
    // ...
  },
  // ...
];
```

### 2. Мои задачи (`TasksContext.js`)
**Файл:** `src/context/TasksContext.js`  
**Строка:** 48  
**Данные:** `initialMyTasks`

```javascript
const initialMyTasks = [
  {
    id: 101,
    title: 'Ремонт крана',
    price: 2000,
    isMyTask: true,
    // ...
  },
  // ...
];
```

## 🔄 Где хранятся данные

- **Чаты:** `AsyncStorage` с ключом `@chats_list`
- **Сообщения:** `AsyncStorage` с ключом `@chat_messages_{chatId}`
- **Задачи:** `AsyncStorage` через `TaskStorage` (см. `src/utils/localStorage.js`)

## 📝 Как изменить тестовые данные

1. **Чаты:** Отредактируйте `MOCK_CHATS` в `ChatsScreen.js`
2. **Сообщения:** Отредактируйте `initialMessages` в `ChatScreen.js`
3. **Задачи:** Отредактируйте `initialAllTasks` и `initialMyTasks` в `TasksContext.js`

## 🗑️ Как очистить данные

```javascript
// Очистить все чаты
await AsyncStorage.removeItem('@chats_list');

// Очистить сообщения конкретного чата
await AsyncStorage.removeItem('@chat_messages_1');

// Очистить все задачи (через TaskStorage)
await TaskStorage.clearAll();
```
