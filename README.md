# YoTube — планировщик публикаций

YoTube — монорепозиторий для планирования и организации публикаций. Проект использует JavaScript без TypeScript: React + Vite на клиенте и Node.js + Express + Mongoose на сервере. MongoDB хранит пользователей, пространства, материалы, медиафайлы и конфликты расписания.

## Быстрый запуск

Требуются Node.js 22+, npm и MongoDB (локальная или облачная).

1. Установите зависимости из корня проекта:

   ```bash
   npm install
   ```

2. Создайте `.env` на основе примера:

   ```bash
   cp .env.example .env
   ```

   Укажите `MONGODB_URI` и `JWT_SECRET` длиной не менее 32 символов.

3. Запустите клиент и API одной командой:

   ```bash
   npm run dev
   ```

Клиент доступен по адресу http://localhost:3000, API — http://localhost:5000/api/health. Vite проксирует запросы `/api` и `/uploads` на сервер.

При первой авторизации приложение создаёт пространство `Default` и одну демонстрационную публикацию на следующий день. Другие пространства создаются вручную; при удалении пространства удаляются все его материалы. Последнее пространство нельзя удалить, пока не создано другое.

## Команды

- `npm run dev` — запуск клиента и сервера одновременно.
- `npm run dev:client` / `npm run dev:server` — запуск отдельных частей.
- `npm run build` — проверка синтаксиса серверного JavaScript и production-сборка React/Vite.
- `npm run start` — запуск API без режима наблюдения.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/workspaces`, `POST /api/workspaces`, `DELETE /api/workspaces/:id`
- `GET/POST /api/materials`, `GET/PUT/DELETE /api/materials/:id`
- `GET/POST /api/media`, `GET/DELETE /api/media/:id`
- `GET /api/conflicts?status=pending|resolved|all`, `PATCH /api/conflicts/:id/resolve`, `PATCH /api/conflicts/:id/reschedule`

Коллекция запросов Postman находится в `postman/YoTube.postman_collection.json`; импортируйте её в Postman и задайте переменные коллекции перед тестированием.

Запросы пользователя требуют `Authorization: Bearer <JWT>`. При создании или изменении запланированной публикации API проверяет другие материалы того же пользователя и пространства на той же платформе в пределах ±30 минут. Загрузки файлов ограничены настройкой `MAX_UPLOAD_SIZE_MB`.

## Переменные окружения

См. `.env.example`. Не добавляйте в репозиторий `.env`, JWT-секреты и загруженные пользовательские файлы.
