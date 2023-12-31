# Используйте официальный образ Node.js в качестве базового образа
FROM node:latest

# Установка директории приложения внутри контейнера
WORKDIR /usr/src/app

# Копирование зависимостей и установка их
COPY package*.json ./
RUN npm install

# Копирование файлов приложения
COPY . .

# Определение порта, на котором будет работать приложение
EXPOSE 3000

# Команда для запуска приложения
CMD [ "node", "app.js" ]