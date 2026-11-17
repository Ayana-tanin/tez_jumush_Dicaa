# 📁 Рекомендации по организации папок для изображений и шрифтов

## Текущая ситуация

### Что есть сейчас:
- ✅ `assets/` - иконки приложения и некоторые изображения
- ✅ `assets/images/` - подпапка с изображениями (logo.png, manRegister.png)
- ❌ `PoetsenOne/` в корне - шрифты (плохая практика)
- ✅ `public/icons/` - PWA иконки

### Проблемы:
1. Шрифты хранятся в корне `frontend/`, а не в `assets/`
2. Изображения разбросаны между `assets/` и `assets/images/`
3. Нет четкой категоризации изображений

---

## 🎯 Рекомендуемая структура

### Для React Native/Expo проекта лучшая практика:

```
frontend/
├── assets/
│   ├── fonts/                    # 📝 ВСЕ ШРИФТЫ
│   │   ├── PoetsenOne/
│   │   │   ├── Poetsenone.ttf
│   │   │   ├── COPYRIGHT.txt
│   │   │   └── LICENSE.txt
│   │   └── (другие шрифты при необходимости)
│   │
│   ├── images/                   # 🖼️ ВСЕ ИЗОБРАЖЕНИЯ ПРИЛОЖЕНИЯ
│   │   ├── auth/                 # Изображения для авторизации/регистрации
│   │   │   ├── whoYOU.png
│   │   │   ├── RegPageWorker.png
│   │   │   ├── RegPageEmployeer.png
│   │   │   └── manRegister.png
│   │   │
│   │   ├── icons/                # Иконки UI (не приложения)
│   │   │   └── logo.png
│   │   │
│   │   ├── common/               # Общие изображения
│   │   │   ├── worker.png
│   │   │   └── emoloyer.png
│   │   │
│   │   └── backgrounds/          # Фоновые изображения (если есть)
│   │
│   └── app-icons/                # 🎨 ИКОНКИ ПРИЛОЖЕНИЯ (для app.json)
│       ├── icon.png
│       ├── splash-icon.png
│       ├── adaptive-icon.png
│       └── favicon.png
│
└── public/
    └── icons/                    # PWA иконки (для веб-версии)
```

---

## ✅ Преимущества такой структуры

1. **Четкая организация** - всё логично разделено по назначению
2. **Легко найти** - знаешь, где искать любой файл
3. **Масштабируемость** - легко добавлять новые категории
4. **Соответствие стандартам** - соответствует лучшим практикам React Native/Expo
5. **Поддержка Metro/Webpack** - все инструменты работают корректно

---

## 📝 Правила именования

### Изображения:
- ✅ Используйте `camelCase`: `regPageWorker.png`
- ✅ Или `kebab-case`: `reg-page-worker.png`
- ❌ Избегайте пробелов: `Reg Page Worker.png`

### Шрифты:
- ✅ Храните каждый шрифт в отдельной папке
- ✅ Сохраняйте лицензии и copyright файлы вместе со шрифтом

---

## 🔧 Использование в коде

### Изображения:
```javascript
// ✅ Хорошо - понятный путь
import logo from '../../assets/images/icons/logo.png';
<Image source={require('../../assets/images/auth/whoYOU.png')} />

// ❌ Плохо - неясный путь
<Image source={require('../../../assets/whoYOU.png')} />
```

### Шрифты (Expo):
```javascript
import { useFonts } from 'expo-font';
import * as Font from 'expo-font';

const fonts = {
  'PoetsenOne': require('./assets/fonts/PoetsenOne/Poetsenone.ttf'),
};

await Font.loadAsync(fonts);
```

---

## 📦 Альтернативная структура (если предпочитаете)

Если хотите сохранить иконки приложения в корне `assets/` (как сейчас), можно так:

```
assets/
├── fonts/
├── images/
│   ├── auth/
│   ├── icons/
│   └── common/
├── icon.png              # Иконки приложения в корне
├── splash-icon.png
└── ...
```

Это тоже приемлемо, так как Expo ожидает иконки в корне `assets/`.

---

## 🚀 Следующие шаги

1. ✅ Создать папку `assets/fonts/`
2. ✅ Переместить `PoetsenOne/` в `assets/fonts/`
3. ✅ Реорганизовать изображения по категориям
4. ✅ Обновить пути в коде
5. ✅ Обновить `app.json` при необходимости

---

## 📚 Полезные ссылки

- [Expo Assets Documentation](https://docs.expo.dev/guides/assets/)
- [React Native Image Guide](https://reactnative.dev/docs/images)
- [Expo Fonts](https://docs.expo.dev/versions/latest/sdk/font/)

