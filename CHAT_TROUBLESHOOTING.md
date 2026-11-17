# Диагностика проблем с отправкой сообщений

## ✅ Исправленные проблемы

### 1. Неправильное сравнение sender_id
**Проблема:** В `ChatScreen.js` сравнивался `sender_id` (число) с `userRole` (строка)
```javascript
// ❌ Было:
me: msg.sender_id === userRole, // userRole = 'employer'/'worker'

// ✅ Стало:
me: msg.sender_id === currentUserId, // currentUserId = 123
```

### 2. Отсутствие user_id в контексте
**Проблема:** Код не получал ID текущего пользователя
```javascript
// ✅ Добавлено:
const [currentUserId, setCurrentUserId] = useState(null);
setCurrentUserId(authStatus.user.id);
```

### 3. Неправильный IP адрес
**Проблема:** IP адрес в конфигурации устарел
```javascript
// ❌ Было: 10.62.74.121
// ✅ Стало: 10.208.238.121
```

## 🔍 Как диагностировать проблемы

### 1. Проверка подключения к backend
```bash
# Запустите тест:
node test_chat_detailed.js

# Или проверьте вручную:
curl http://10.208.238.121:8000/health
```

### 2. Проверка IP адреса
```bash
# Windows:
ipconfig

# Обновите IP в файлах:
# - frontend/.env
# - frontend/src/utils/api.js
```

### 3. Проверка backend
```bash
# Убедитесь, что backend запущен:
cd backend
python run.py

# Проверьте порт 8000:
netstat -an | findstr :8000
```

### 4. Проверка аутентификации
В консоли браузера/приложения должны быть логи:
```
✅ User loaded: { id: 123, role: 'employer' }
✅ API connection successful
```

## 🚨 Возможные ошибки и решения

### Ошибка: "Не удалось определить пользователя"
**Причина:** Пользователь не авторизован или нет user_id
**Решение:** 
1. Перезайдите в приложение
2. Проверьте Google Auth настройки
3. Убедитесь, что backend возвращает user.id

### Ошибка: "Backend недоступен"
**Причина:** Неправильный IP или backend не запущен
**Решение:**
1. Проверьте IP: `ipconfig`
2. Обновите `.env` файл
3. Запустите backend: `cd backend && python run.py`

### Ошибка: "Чат не найден"
**Причина:** Чат не создан или неправильные параметры
**Решение:**
1. Убедитесь, что есть `applicationId` и `taskId`
2. Проверьте, что отклик принят (статус 'accepted')
3. Создайте чат через API

### Ошибка: "Недостаточно прав"
**Причина:** Пользователь не является участником чата
**Решение:**
1. Проверьте, что пользователь - employer или worker задачи
2. Убедитесь, что отклик принадлежит этому пользователю

## 📱 Тестирование в приложении

### 1. Включите отладку API
В `frontend/src/utils/api.js`:
```javascript
const DEBUG_API = true; // Включить логи API
```

### 2. Проверьте консоль
Должны быть логи:
```
🌐 API Configuration: Base URL: http://10.208.238.121:8000
✅ User loaded: { id: 123, role: 'employer' }
✅ Chat found: 456
✅ Message sent via API
```

### 3. Проверьте локальное хранилище
```javascript
// В консоли браузера:
AsyncStorage.getItem('userToken').then(console.log);
AsyncStorage.getItem('userData').then(console.log);
```

## 🔧 Быстрые исправления

### Обновить IP адрес:
```bash
# 1. Узнать текущий IP:
ipconfig

# 2. Обновить в frontend/.env:
EXPO_PUBLIC_API_BASE_URL=http://YOUR_NEW_IP:8000

# 3. Обновить в frontend/src/utils/api.js:
const LAPTOP_IP = 'YOUR_NEW_IP';
```

### Перезапустить сервисы:
```bash
# Backend:
cd backend
python run.py

# Frontend:
cd frontend
npm start
```

### Очистить кэш:
```bash
cd frontend
npm start -- --clear
```

## 📋 Чеклист для отправки сообщений

- [ ] Backend запущен на правильном IP
- [ ] Frontend подключается к правильному IP
- [ ] Пользователь авторизован (есть token и user_id)
- [ ] Есть applicationId и taskId
- [ ] Отклик принят (для создания чата)
- [ ] Чат создан или найден
- [ ] API возвращает корректные данные

## 🎯 Следующие шаги

1. **Тестирование:** Используйте `test_chat_detailed.js` для проверки API
2. **Мониторинг:** Следите за логами в консоли приложения
3. **Отладка:** Включите `DEBUG_API = true` для детальных логов
4. **Документация:** Проверьте API docs: `http://10.208.238.121:8000/docs`