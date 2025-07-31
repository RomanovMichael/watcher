# Backend для VK ID авторизации

## Установка

```bash
npm install
```

## Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```env
# Порт сервера
PORT=3001

# URL фронтенда
FRONTEND_URL=https://localhost:3000

# VK ID настройки
VK_APP_ID=51839671
VK_CLIENT_SECRET=your_vk_client_secret
VK_REDIRECT_URI=https://localhost:3000/vkid/callback

# JWT секреты
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
```

## Запуск

### Разработка

```bash
npm run dev
```

### Продакшн

```bash
npm run build
npm start
```

## API эндпоинты

### POST /api/auth/vkid

Обмен кода авторизации на токены

**Тело запроса:**

```json
{
  "code": "authorization_code",
  "device_id": "device_id",
  "codeVerifier": "pkce_code_verifier"
}
```

**Ответ:**

```json
{
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": 123456,
    "email": "user@example.com",
    "phone": "+79001234567",
    "first_name": "Иван",
    "last_name": "Иванов"
  }
}
```

### GET /api/auth/me

Получение данных текущего пользователя

**Заголовки:**

```
Authorization: Bearer <access_token>
```

### POST /api/auth/refresh

Обновление токена

**Тело запроса:**

```json
{
  "refresh_token": "jwt_refresh_token"
}
```

### POST /api/auth/logout

Выход из системы
