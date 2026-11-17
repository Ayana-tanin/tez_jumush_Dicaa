FROM node:20-alpine

# Установка Expo CLI и ngrok для туннелей
RUN npm install -g @expo/cli @expo/ngrok

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей с игнорированием peer dependencies
RUN npm install --legacy-peer-deps

# Копирование исходного кода
COPY . .

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expo -u 1001
RUN chown -R expo:nodejs /app
USER expo

# Открытие портов
EXPOSE 19000 19001 19002

# Команда запуска (валидные варианты host: tunnel | lan | localhost)
CMD ["npx", "expo", "start", "--tunnel", "--port", "19000"]
