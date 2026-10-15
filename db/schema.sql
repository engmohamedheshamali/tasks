-- Schema from SCHEMATODOAPP.pgerd (pgAdmin ERD)

CREATE TABLE IF NOT EXISTS public.users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.todos (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    completed   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
