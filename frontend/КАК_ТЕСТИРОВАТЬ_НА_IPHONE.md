# 📱 Тестирование на iPhone: Expo Go и TestFlight

Руководство по запуску и тестированию приложения на iPhone через QR-код с использованием Expo Go и TestFlight.

## 🚨 Быстрый ответ (Если вы на Windows и получили ошибку)

Если вы видите ошибку **"iOS apps can only be built on macOS devices"**, это значит, что вы использовали неправильную команду.

**❌ Неправильно (не работает на Windows):**
```bash
npx expo run:ios
npm run ios
```

**✅ Правильно (работает на Windows, macOS, Linux):**
```bash
cd frontend
npm run start:tunnel
```

Эта команда запустит сервер разработки с QR-кодом, который можно отсканировать на iPhone через приложение Expo Go.

---

## 🚀 Вариант 1: Тестирование через Expo Go (Быстро и просто)

### Преимущества:
- ✅ Быстрое развертывание
- ✅ Горячая перезагрузка (Hot Reload)
- ✅ Не требует сборки приложения
- ✅ Работает для разработки и тестирования

### Требования:
- iPhone с iOS 13.0 или новее
- Приложение Expo Go установлено на iPhone ([App Store](https://apps.apple.com/app/expo-go/id982107779))
- Компьютер и iPhone подключены к одной сети Wi-Fi (или используйте tunnel режим)

### ⚠️ Важно для пользователей Windows:
- **НЕ используйте** `expo run:ios` - эта команда работает только на macOS
- **Используйте** `expo start --tunnel` для генерации QR-кода
- Для тестирования через Expo Go **НЕ нужно** собирать приложение локально

---

### Шаг 1: Установка Expo Go на iPhone

1. Откройте **App Store** на iPhone
2. Найдите и установите приложение **"Expo Go"**
3. Откройте приложение Expo Go

---

### Шаг 2: Запуск сервера разработки с QR-кодом

> **💡 Важно:** Если вы на Windows и видите ошибку "iOS apps can only be built on macOS", это нормально! 
> Команда `expo run:ios` пытается собрать приложение, но для тестирования через Expo Go это **не нужно**.
> Используйте команды ниже - они работают на Windows, macOS и Linux.

#### Способ A: Tunnel режим (Рекомендуется для iPhone и Windows)

Tunnel режим работает даже если iPhone и компьютер в разных сетях. **Это единственный способ, который гарантированно работает на Windows.**

**В PowerShell выполните:**
```bash
cd frontend
npx expo start --tunnel
```

**Или используйте npm скрипт (рекомендуется):**
```bash
npm run start:tunnel
```

**Или используйте специальный скрипт для iPhone (с очисткой кеша):**
```bash
npm run start:iphone
```

После запуска вы увидите QR-код в терминале:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █
█ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █
...
```

#### Способ B: LAN режим (Если в одной сети Wi-Fi)

Если iPhone и компьютер подключены к одной сети Wi-Fi:

```bash
cd frontend
npx expo start --lan
```

**Или используйте npm скрипт:**
```bash
npm run start:lan
```

---

### Шаг 3: Сканирование QR-кода на iPhone

#### Вариант A: Через камеру iPhone (iOS 11+)

1. Откройте стандартное приложение **Камера** на iPhone
2. Наведите камеру на QR-код в терминале
3. Нажмите на уведомление, которое появится вверху экрана
4. Выберите **"Открыть в Expo Go"**

#### Вариант B: Через приложение Expo Go

1. Откройте приложение **Expo Go** на iPhone
2. Нажмите на вкладку **"Scan QR code"** (внизу экрана)
3. Отсканируйте QR-код из терминала
4. Приложение автоматически загрузится и откроется!

---

### Шаг 4: Проверка подключения

После сканирования QR-кода:
- Приложение начнет загружаться на iPhone
- В терминале вы увидите сообщение о подключении устройства
- Первая загрузка может занять 1-2 минуты

### Полезные команды в терминале Expo:

- `r` - Перезагрузить приложение
- `m` - Показать меню разработчика
- `j` - Открыть DevTools в браузере
- `i` - Открыть iOS симулятор (если установлен)
- `a` - Открыть Android эмулятор (если установлен)

---

## 📦 Вариант 2: Тестирование через TestFlight (Для production-тестирования)

### Преимущества:
- ✅ Полноценное standalone приложение
- ✅ Может использовать все нативные модули
- ✅ Близко к production версии
- ✅ Можно распространять среди тестеров
- ✅ Работает без Expo Go

### Требования:
- Apple Developer Account ($99/год)
- Аккаунт в App Store Connect
- Настроенный EAS Build или expo build:ios

---

### Шаг 1: Установка EAS CLI (Expo Application Services)

```bash
npm install -g eas-cli
```

### Шаг 2: Вход в Expo аккаунт

```bash
eas login
```

Если у вас нет аккаунта, создайте его:
```bash
eas register
```

### Шаг 3: Настройка проекта для EAS Build

Инициализируйте EAS Build:

```bash
cd frontend
eas build:configure
```

Это создаст файл `eas.json` в корне проекта frontend.

### Шаг 4: Настройка app.json для iOS сборки

Убедитесь, что в `app.json` (или `frontend/app.json`) указаны правильные настройки:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tezjumush.app",
      "buildNumber": "1"
    }
  }
}
```

### Шаг 5: Сборка для iOS (Development Build)

Для тестирования через TestFlight создайте development build:

```bash
eas build --platform ios --profile development
```

Или для production build:

```bash
eas build --platform ios --profile production
```

### Шаг 6: Настройка профилей сборки в eas.json

Создайте или обновите `eas.json` в папке `frontend`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "your-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

### Шаг 7: Загрузка в TestFlight

После успешной сборки загрузите билд в TestFlight:

#### Автоматическая загрузка:
```bash
eas submit --platform ios --latest
```

#### Ручная загрузка:
1. Дождитесь завершения сборки
2. EAS предоставит ссылку на `.ipa` файл
3. Загрузите его через [App Store Connect](https://appstoreconnect.apple.com/)
   - Перейдите в **My Apps** → Ваше приложение → **TestFlight**
   - Нажмите **"+ Build"** и загрузите `.ipa` файл

### Шаг 8: Настройка тестеров в TestFlight

1. Зайдите в [App Store Connect](https://appstoreconnect.apple.com/)
2. Выберите ваше приложение → **TestFlight**
3. Во вкладке **"Internal Testing"** добавьте тестеров:
   - Добавьте email адреса тестеров
   - Они получат приглашение по email
4. Или используйте **"External Testing"** для публичного тестирования:
   - Создайте группу тестеров
   - Добавьте тестеров (до 10,000 для внешних тестеров)
   - Тестеры получат ссылку для установки

### Шаг 9: Установка через TestFlight

Тестеры должны:

1. Установить приложение **TestFlight** с App Store (если еще не установлено)
2. Открыть ссылку-приглашение, полученную по email
3. Или открыть TestFlight и найти ваше приложение
4. Нажать **"Install"** или **"Accept"**

---

## 🔄 Быстрое сравнение: Expo Go vs TestFlight

| Функция | Expo Go | TestFlight |
|---------|---------|------------|
| Скорость развертывания | ⚡ Мгновенно | ⏱️ 10-30 минут (сборка) |
| Горячая перезагрузка | ✅ Да | ❌ Нет |
| Нативные модули | ⚠️ Ограничено | ✅ Все |
| Распространение | 👤 Только вы | 👥 До 10,000 тестеров |
| Стоимость | 💰 Бесплатно | 💰 $99/год (Apple Developer) |
| Использование | 🛠️ Разработка | 🚀 Production-тестирование |

---

## 🛠️ Устранение проблем

### Проблема: "iOS apps can only be built on macOS devices" (на Windows)

**Ошибка:**
```
iOS apps can only be built on macOS devices. Use eas build -p ios to build in the cloud.
```

**Причина:**
Команда `expo run:ios` (или `npm run ios`) пытается собрать iOS приложение локально, но это возможно только на macOS.

**Решение:**
Для тестирования на iPhone через Expo Go **НЕ нужно** собирать приложение! Используйте команду для запуска сервера разработки:

```bash
# Правильная команда для Windows (и любой ОС):
cd frontend
npm run start:tunnel
# или
npm run start:iphone
```

**Важно:**
- ✅ `expo start --tunnel` - работает на Windows, macOS, Linux
- ❌ `expo run:ios` - работает только на macOS
- Для Expo Go достаточно `expo start`, не нужна сборка!

---

### Проблема: QR-код не сканируется на iPhone

**Решение:**
1. Убедитесь, что используете tunnel режим: `npx expo start --tunnel`
2. Проверьте, что iPhone и компьютер подключены к интернету
3. Попробуйте увеличить яркость экрана компьютера
4. Используйте приложение Expo Go для сканирования вместо камеры

### Проблема: "Unable to connect to Expo"

**Решение:**
1. Проверьте, что Metro bundler запущен
2. Убедитесь, что iPhone и компьютер в одной сети (для LAN режима)
3. Используйте tunnel режим: `npx expo start --tunnel`
4. Проверьте файрвол на компьютере

### Проблема: Приложение не загружается

**Решение:**
1. Перезапустите Metro bundler: `Ctrl+C`, затем `npx expo start --tunnel`
2. Очистите кеш: `npx expo start --tunnel --clear`
3. Переустановите Expo Go на iPhone
4. Проверьте версию Expo SDK в `app.json` (должна быть совместима с Expo Go)

### Проблема: Сборка для TestFlight не проходит

**Решение:**
1. Убедитесь, что у вас есть активный Apple Developer аккаунт
2. Проверьте bundle identifier в `app.json`
3. Убедитесь, что сертификаты и профили настроены правильно
4. Проверьте логи сборки в EAS Dashboard

---

## 📝 Полезные команды

```bash
# Запуск с tunnel режимом (для iPhone)
cd frontend
npm run start:tunnel

# Запуск с LAN режимом (если в одной сети)
npm run start:lan

# Запуск с очисткой кеша
npx expo start --tunnel --clear

# Проверка подключения устройств
npx expo start --tunnel --dev-client

# Сборка для TestFlight (development)
eas build --platform ios --profile development

# Сборка для TestFlight (production)
eas build --platform ios --profile production

# Загрузка в TestFlight
eas submit --platform ios --latest

# Просмотр статуса сборки
eas build:list
```

---

## ✅ Чеклист для тестирования на iPhone

### Для Expo Go:
- [ ] Expo Go установлен на iPhone
- [ ] Metro bundler запущен с `--tunnel`
- [ ] QR-код виден в терминале
- [ ] iPhone подключен к интернету
- [ ] QR-код успешно отсканирован
- [ ] Приложение загрузилось на iPhone

### Для TestFlight:
- [ ] Apple Developer аккаунт активен
- [ ] EAS CLI установлен и настроен
- [ ] `eas.json` создан и настроен
- [ ] `app.json` содержит правильный bundleIdentifier
- [ ] Сборка успешно завершена
- [ ] Приложение загружено в App Store Connect
- [ ] Тестеры добавлены в TestFlight
- [ ] Тестеры получили приглашения

---

## 🎯 Рекомендации

1. **Для разработки**: Используйте Expo Go - это самый быстрый способ
2. **Для внутреннего тестирования**: Используйте TestFlight с Internal Testing
3. **Для публичного бета-тестирования**: Используйте TestFlight с External Testing
4. **Для production**: Создайте production build и опубликуйте в App Store

---

Готово! Теперь вы можете тестировать приложение на iPhone через Expo Go и TestFlight! 🎉

