# Настройка для Production (Play Market)

## 🌐 URL вместо IP адреса

Для публикации в Play Market **НЕ используйте IP адрес**. Вместо этого используйте **домен (URL)** вашего backend сервера.

## 📋 Варианты настройки:

### Вариант 1: Через EAS Environment Variables (Рекомендуется)

1. **Установите переменную окружения в EAS:**

```bash
cd frontend
npx eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://api.yourapp.com --type string
```

2. **Или через веб-интерфейс EAS:**
   - Зайдите на https://expo.dev
   - Выберите проект
   - Settings → Secrets
   - Добавьте `EXPO_PUBLIC_API_BASE_URL` = `https://api.yourapp.com`

3. **Обновите eas.json:**

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://api.yourapp.com"
      }
    }
  }
}
```

### Вариант 2: Через переменную окружения при сборке

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourapp.com npx eas build --platform android --profile production
```

### Вариант 3: Хардкод в коде (НЕ рекомендуется, но работает)

Измените `src/utils/api.js`:

```javascript
const getApiBaseUrl = () => {
  // Production URL
  if (process.env.NODE_ENV === 'production' || !__DEV__) {
    return 'https://api.yourapp.com';
  }
  
  // Development
  const LAPTOP_IP = '10.208.238.121';
  return `http://${LAPTOP_IP}:8000`;
};
```

## 🔒 Требования к URL:

1. **HTTPS обязательно** (Google Play требует безопасное соединение)
2. **Домен должен быть доступен из интернета**
3. **SSL сертификат должен быть валидным**

## 📝 Примеры правильных URL:

✅ **Правильно:**
- `https://api.tezjumush.kg`
- `https://api.yourapp.com`
- `https://backend.yourapp.com`

❌ **Неправильно:**
- `http://10.208.238.121:8000` (IP адрес)
- `http://api.yourapp.com` (без HTTPS)
- `http://localhost:8000` (локальный адрес)

## 🚀 Деплой Backend:

### Варианты размещения backend:

1. **VPS сервер** (DigitalOcean, Linode, AWS EC2)
   - Установите домен
   - Настройте SSL (Let's Encrypt)
   - Домен: `https://api.yourapp.com`

2. **Cloud провайдеры:**
   - AWS Elastic Beanstalk
   - Google Cloud Run
   - Azure App Service
   - Heroku

3. **Docker хостинг:**
   - Railway
   - Render
   - Fly.io

## 🔧 Настройка домена:

1. **Купите домен** (например, `yourapp.com`)
2. **Создайте поддомен** для API (например, `api.yourapp.com`)
3. **Настройте DNS:**
   ```
   A record: api.yourapp.com → IP вашего сервера
   ```
4. **Установите SSL сертификат:**
   ```bash
   # Используя Let's Encrypt (certbot)
   certbot --nginx -d api.yourapp.com
   ```

## 📦 Сборка с production URL:

```bash
cd frontend

# Установите переменную в EAS (один раз)
npx eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://api.yourapp.com

# Соберите production build
npx eas build --platform android --profile production
```

## ✅ Проверка:

После сборки проверьте, что приложение использует правильный URL:
- Откройте приложение
- Проверьте логи (если включен DEBUG)
- Должно быть: `🌐 Using API URL from environment: https://api.yourapp.com`

## 🔐 Безопасность:

- ✅ Всегда используйте HTTPS
- ✅ Настройте CORS на backend для вашего домена
- ✅ Используйте переменные окружения, не хардкодьте URL в коде
- ✅ Храните secrets в EAS, не в git
