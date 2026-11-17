# Исправление ошибки "TypeError: fetch failed" в Metro Bundler

## Проблема
При запуске `npx expo start` возникает ошибка:
```
TypeError: fetch failed
    at node:internal/deps/undici/undici:13510:13
```

## Возможные причины
1. **Expo пытается загрузить обновления** при старте
2. **Проблемы с сетью/прокси** - блокировка запросов
3. **Кеш Metro** содержит поврежденные данные
4. **Проблемы с переменными окружения** - неправильный URL в `.env`

## Решения

### 1. Очистка кеша и перезапуск
```powershell
cd AppTezJumush\frontend
npx expo start --clear
```

### 2. Если не помогло - полная очистка
```powershell
cd AppTezJumush\frontend
# Удаляем кеш
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
# Переустанавливаем зависимости
npm install
# Запускаем с очисткой
npx expo start --clear
```

### 3. Проверка переменных окружения
Убедитесь, что в `.env` файле правильный URL:
```env
EXPO_PUBLIC_API_BASE_URL=http://10.132.58.121:8000
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_DEBUG_API_CALLS=true
```

### 4. Запуск в офлайн режиме (если проблема с сетью)
```powershell
npx expo start --offline
```

### 5. Проверка прокси/файрвола
- Убедитесь, что файрвол не блокирует Node.js
- Если используете прокси, настройте его для Node.js:
```powershell
$env:HTTP_PROXY="http://proxy:port"
$env:HTTPS_PROXY="http://proxy:port"
```

### 6. Альтернативный запуск
```powershell
# Запуск без автоматического открытия браузера
npx expo start --no-open

# Запуск только для локальной сети
npx expo start --lan
```

## Если ничего не помогает

1. **Проверьте версию Node.js**: `node --version` (должна быть 18+)
2. **Обновите Expo CLI**: `npm install -g expo-cli@latest`
3. **Проверьте интернет-соединение** - Expo может пытаться загрузить обновления

## Дополнительная информация

Ошибка происходит на уровне Node.js (undici), а не React Native. Это означает, что проблема в:
- Сетевых запросах при инициализации Metro
- Загрузке конфигурации Expo
- Проверке обновлений

Если проблема сохраняется, попробуйте запустить с флагом `--no-dev`:
```powershell
npx expo start --no-dev
```











