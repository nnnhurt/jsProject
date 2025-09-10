
# 🐶 API4DogsJS

Небольшой проект на **Node.js + Express** с использованием **MongoDB**.  
API сочетает в себе:
- работу с внешними сервисами (**The Dog API**);
- хранение собственных данных в MongoDB (виртуальные питомцы);
- игровую механику "погладить собаку".

---

## 🚀 Функциональные возможности
- Получение списка пород собак.
- Получение случайной фотографии собаки.
- Получение случайной фотографии по породе.
- Получение краткой информации о породе.
- Авторизация по API-ключу.
- Заведение виртуальной собаки (хранится в MongoDB).
- Возможность погладить собаку и отслеживать её настроение.

---

## 🗄️ Схема базы данных (MongoDB)

Коллекция: `dogs`
```json
{
  "_id": "ObjectId",
  "name": "string",          // Имя собаки
  "breed": "string",         // Порода
  "happinessLevel": "number", // Уровень счастья (0 = грустная, 100 = очень счастливая)
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 🔑 Авторизация
- Все маршруты защищены API-ключом.
- Ключ передаётся в заголовке:
```http
x-api-key: <ваш_ключ>
```

---

## 📡 Маршруты API

### Внешние данные (Dog CEO API, The Dog API)

#### `GET /breeds`
Список всех пород.
```json
{ "breeds": ["bulldog", "beagle", "husky"] }
```

#### `GET /images/random`
Случайное изображение собаки.
```json
{ "imageUrl": "https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg" }
```

#### `GET /breeds/:breed/images/random`
Случайное изображение по породе.
```json
{
  "breed": "husky",
  "imageUrl": "https://images.dog.ceo/breeds/husky/n02110185_1469.jpg"
}
```

#### `GET /breeds/:breed/info`
Информация о породе (через The Dog API).
```json
{
  "breed": "husky",
  "weight": "20-27",
  "height": "50-60",
  "life_span": "12 years",
  "temperament": "Friendly, Alert, Gentle, Intelligent"
}
```

---

### Локальные данные (MongoDB)

#### `POST /dogs`
Завести собаку.
```json
// Request
{
  "name": "Buddy",
  "breed": "husky"
}

// Response
{
  "id": "64a9f0c8e4b1a9e1a2f12345",
  "name": "Buddy",
  "breed": "husky",
  "happinessLevel": 50
}
```

#### `POST /dogs/:id/pet`
Погладить собаку (увеличить уровень счастья на 20, максимум = 100).
```json
{
  "id": "64a9f0c8e4b1a9e1a2f12345",
  "name": "Buddy",
  "breed": "husky",
  "happinessLevel": 70
}
```

#### `GET /dogs/:id`
Информация о конкретной собаке.
```json
{
  "id": "64a9f0c8e4b1a9e1a2f12345",
  "name": "Buddy",
  "breed": "husky",
  "happinessLevel": 70
}
```

---

## 📂 Структура проекта
```
project/
├── src/
│   ├── routes/
│   │   ├── breeds.js
│   │   ├── images.js
│   │   └── dogs.js
│   ├── models/
│   │   └── Dog.js
│   ├── middleware/
│   │   └── auth.js
│   └── app.js
├── package.json
└── README.md
```

---

## ⚙️ Стек технологий
- Node.js
- Express
- MongoDB + Mongoose
- Axios (для запросов к внешним API)

---

## 🐾 Идеи для расширения
- Добавить расписание игр и прогулок.
- Поддержка нескольких владельцев (пользователи).
- Возможность обучать собаку новым командам.
- Лайки и рейтинг любимых пород.
