# Используем более свежую версию Node.js
FROM node:18.16.0-alpine as builder

WORKDIR /app

# Копируем зависимости отдельно для кеширования
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Копируем остальные файлы
COPY . .

# Собираем приложение
RUN npm run build

# Финальный образ с nginx
FROM nginx:1.25-alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]