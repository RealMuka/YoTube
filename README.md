# YoTube — content planner

Монорепозиторий планировщика публикаций. `client/` — React + Vite интерфейс, `server/` — Node.js + Express + Mongoose API. Данные материалов, пользователей, медиа и конфликтов хранятся в MongoDB.

## Запуск

Требования: Node.js 22+, npm и доступная MongoDB.

1. Установите зависимости из корня репозитория: `npm install`.
2. Скопируйте `.env.example` в `.env` и задайте `MONGODB_URI` и случайный `JWT_SECRET` (не менее 32 символов).
3. Запустите API и интерфейс одной командой:

```bash
npm run dev
```

Интерфейс: http://localhost:3000. API: http://localhost:5000/api/health. Vite проксирует `/api` и `/uploads` к серверу.

## Команды

- `npm run dev` — клиент и сервер параллельно.
- `npm run dev:client` / `npm run dev:server` — запуск по отдельности.
- `npm run build` — компиляция серверной части и production-сборка клиента.
- `npm run typecheck` — проверка TypeScript обеих частей.
- `npm run start` — запуск собранного API.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/materials`, `GET/PUT/DELETE /api/materials/:id`
- `GET/POST /api/media`, `GET/DELETE /api/media/:id`
- `GET /api/conflicts?status=pending|resolved|all`, `PATCH /api/conflicts/:id/resolve`, `PATCH /api/conflicts/:id/reschedule`

Изменяющие и пользовательские API-запросы требуют `Authorization: Bearer <JWT>`. При создании/обновлении запланированной публикации сервер выявляет пересечения на одной платформе в пределах 30 минут и сохраняет записи конфликтов. Загрузки разрешают изображения, видео, аудио и PDF с ограничением размера из `MAX_UPLOAD_SIZE_MB`.

## Переменные окружения

См. `.env.example`. Не коммитьте `.env`, JWT-секрет или загруженные пользовательские файлы.
