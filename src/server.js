require("dotenv").config();
const path = require("path");
const express = require("express");
const { query, initSchema } = require("./db");
const { validate, asyncHandler } = require("./validate");
const { errorHandler } = require("./errorHandler");
const {
  createUserSchema,
  createTodoSchema,
  updateTodoSchema,
  todoIdParamsSchema,
  userIdQuerySchema,
} = require("./schemas");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get(
  "/api/users",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      "SELECT id, username, email, created_at FROM users ORDER BY id"
    );
    res.json(rows);
  })
);

app.post(
  "/api/users",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    const { rows } = await query(
      "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username, email, created_at",
      [username, email]
    );
    res.status(201).json(rows[0]);
  })
);

app.get(
  "/api/todos",
  validate(userIdQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { user_id } = req.query;
    const { rows } = await query(
      `SELECT id, user_id, title, description, completed, created_at
       FROM todos
       WHERE user_id = $1
       ORDER BY completed, id DESC`,
      [user_id]
    );
    res.json(rows);
  })
);

app.post(
  "/api/todos",
  validate(createTodoSchema),
  asyncHandler(async (req, res) => {
    const { user_id, title, description } = req.body;
    const { rows } = await query(
      `INSERT INTO todos (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, title, description, completed, created_at`,
      [user_id, title, description]
    );
    res.status(201).json(rows[0]);
  })
);

app.patch(
  "/api/todos/:id",
  validate(todoIdParamsSchema, "params"),
  validate(updateTodoSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const { rows } = await query(
      `UPDATE todos SET completed = $1 WHERE id = $2
       RETURNING id, user_id, title, description, completed, created_at`,
      [completed, id]
    );
    if (!rows[0]) {
      return res.status(404).json({ error: "todo not found" });
    }
    res.json(rows[0]);
  })
);

app.delete(
  "/api/todos/:id",
  validate(todoIdParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await query("DELETE FROM todos WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "todo not found" });
    }
    res.status(204).end();
  })
);

app.use(errorHandler);

async function start() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      console.log(`Todo app running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Could not connect to PostgreSQL.");
    console.error(err.message);
    console.error("\n1. Put your postgres password in .env (DB_PASSWORD)");
    console.error("2. Run: npm run setup-db");
    console.error("3. Run: npm start");
    process.exit(1);
  }
}

start();
