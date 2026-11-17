# 🔧 Исправление проблемы подключения к Backend

## Проблема
Frontend не может подключиться к backend - запросы таймаутятся.

## Причина
В логах видно, что используется старый IP адрес `192.168.79.121`, который недоступен.

## ✅ Решение

### 1. IP адрес обновлен в коде
Все файлы уже обновлены с новым IP: `10.132.58.121`

### 2. Создан .env файл
Создан файл `frontend/.env` с правильным IP адресом.

### 3. **ВАЖНО: Перезапустите приложение!**

После изменения IP адреса или переменных окружения нужно:

#### Вариант A: Если используете Expo CLI напрямую
```bash
# Остановите текущий процесс (Ctrl+C)
# Затем перезапустите:
cd AppTezJumush/frontend
npm start
# Или
npx expo start --clear
```

#### Вариант B: Если используете Docker
```bash
cd AppTezJumush
docker-compose restart frontend
```

#### Вариант C: Полный перезапуск
```bash
cd AppTezJumush
docker-compose down
docker-compose up -d
```

### 4. Очистка кэша (если не помогло)

Если после перезапуска все еще используется старый IP:

```bash
cd AppTezJumush/frontend

# Очистка кэша Expo
npx expo start --clear

# Или полная очистка
rm -rf node_modules/.cache
npx expo start --clear
```

### 5. Проверка

После перезапуска в логах должно быть:
```
🌐 Using API URL from environment: http://10.132.58.121:8000
```

Или если переменная окружения не используется:
```
🌐 API_BASE_URL: http://10.132.58.121:8000
```

## 🔍 Если IP адрес изменился

Если ваш IP адрес изменился (например, при переподключении к Wi-Fi):

1. **Узнайте новый IP:**
   ```bash
   ipconfig
   ```
   Найдите IPv4 адрес вашего активного сетевого подключения.

2. **Обновите IP в файлах:**
   - `frontend/.env` - измените `EXPO_PUBLIC_API_BASE_URL`
   - Или обновите `LAPTOP_IP` в файлах:
     - `frontend/src/utils/api.js`
     - `frontend/src/screens/LoginAndRegistration/CodeVerificationScreen.js`
     - `frontend/src/screens/LoginAndRegistration/RegWorker.js`
     - `frontend/src/screens/LoginAndRegistration/RegestrationEmpl.js`

3. **Перезапустите приложение** (см. шаг 3 выше)

## 📝 Текущие настройки

- **Backend работает на:** `http://localhost:8000` (в Docker)
- **Доступен по IP:** `http://10.132.58.121:8000`
- **Frontend настроен на:** `http://10.132.58.121:8000`

## ✅ Проверка работоспособности

После перезапуска проверьте:

1. **Backend доступен:**
   ```bash
   Invoke-WebRequest -Uri http://localhost:8000/health
   ```

2. **Backend доступен по IP:**
   ```bash
   Test-NetConnection -ComputerName 10.132.58.121 -Port 8000
   ```

3. **В логах frontend должно быть:**
   - `✅ Backend connection: 200` (вместо `❌ Backend connection failed`)

## 🐛 Если проблема сохраняется

1. Проверьте, что backend действительно запущен:
   ```bash
   docker-compose ps
   ```

2. Проверьте логи backend:
   ```bash
   docker-compose logs backend --tail 50
   ```

3. Проверьте firewall - возможно, порт 8000 заблокирован

4. Убедитесь, что frontend и backend в одной сети

