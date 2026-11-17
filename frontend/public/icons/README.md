# PWA Icons

Для полноценной работы PWA необходимо создать иконки разных размеров.

## Необходимые размеры:

### Основные иконки:
- `icon-72x72.png` - для Android
- `icon-96x96.png` - для Android
- `icon-128x128.png` - для Chrome
- `icon-144x144.png` - для Windows
- `icon-152x152.png` - для iOS
- `icon-192x192.png` - для Android (рекомендуемый)
- `icon-384x384.png` - для Android
- `icon-512x512.png` - для Android (рекомендуемый)

### Дополнительные иконки:
- `icon-16x16.png` - favicon
- `icon-32x32.png` - favicon
- `icon-57x57.png` - iOS
- `icon-60x60.png` - iOS
- `icon-76x76.png` - iOS
- `icon-114x114.png` - iOS
- `icon-120x120.png` - iOS
- `icon-180x180.png` - iOS (рекомендуемый)

## Создание иконок:

### Используя существующую иконку:
1. Возьмите `assets/icon.png` из проекта
2. Используйте онлайн генератор: https://realfavicongenerator.net/
3. Или используйте команду:
```bash
# Установите ImageMagick
# Затем создайте иконки:
convert assets/icon.png -resize 192x192 public/icons/icon-192x192.png
convert assets/icon.png -resize 512x512 public/icons/icon-512x512.png
```

### Автоматическое создание:
```bash
# Установите pwa-asset-generator
npm install -g pwa-asset-generator

# Создайте все иконки
pwa-asset-generator assets/icon.png public/icons
```

## Временное решение:
Если иконки отсутствуют, браузер будет использовать стандартные иконки. 
Для продакшена обязательно создайте собственные иконки.
