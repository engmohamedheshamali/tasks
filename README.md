# Todo App

Simple Node.js project mapped to the PostgreSQL schema in `SCHEMATODOAPP.pgerd`.

## Tables

- `users`: `id`, `username`, `email` (unique), `created_at`
- `todos`: `id`, `user_id` → `users.id` (ON DELETE CASCADE), `title`, `description`, `completed`, `created_at`

## Setup

1. PostgreSQL 18 is already running on this machine.
2. Open `.env` and set `DB_PASSWORD` to the password of the `postgres` user (the one you use in pgAdmin).
3. In a terminal:

```bash
cd D:\TODOAPP
npm install
npm run setup-db
npm start
```

4. Open [http://localhost:3000](http://localhost:3000)

You can also create the `todoapp` database yourself in pgAdmin, then skip `setup-db`. Tables are created automatically when the server starts.
