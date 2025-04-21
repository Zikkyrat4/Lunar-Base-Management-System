# Этап сборки
FROM node:18-alpine as build

WORKDIR /app

# 1. Копируем только файлы, необходимые для установки зависимостей
COPY package.json package-lock.json ./

# 2. Устанавливаем зависимости (используем чистую установку)
RUN npm ci --legacy-peer-deps

# 3. Копируем остальные файлы проекта
COPY . .

# 4. Собираем приложение
RUN npm run build

# Этап продакшн
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]