const { z } = require("zod");

const createUserSchema = z.object({
  username: z
    .string({ required_error: "username is required" })
    .trim()
    .min(1, "username is required")
    .max(100, "username must be at most 100 characters"),
  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email("invalid email")
    .max(150, "email must be at most 150 characters"),
});

const createTodoSchema = z.object({
  user_id: z.coerce.number().int().positive("user_id must be a positive number"),
  title: z
    .string({ required_error: "title is required" })
    .trim()
    .min(1, "title is required")
    .max(255, "title must be at most 255 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "description is too long")
    .optional()
    .transform((value) => (value ? value : null)),
});

const updateTodoSchema = z.object({
  completed: z.boolean({ required_error: "completed must be true or false" }),
});

const todoIdParamsSchema = z.object({
  id: z.coerce.number().int().positive("todo id must be a positive number"),
});

const userIdQuerySchema = z.object({
  user_id: z.coerce.number().int().positive("user_id must be a positive number"),
});

module.exports = {
  createUserSchema,
  createTodoSchema,
  updateTodoSchema,
  todoIdParamsSchema,
  userIdQuerySchema,
};
