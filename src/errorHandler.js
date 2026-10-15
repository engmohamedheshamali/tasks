const { ZodError } = require("zod");

function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: err.issues.map((issue) => ({
        path: issue.path.join(".") || "body",
        message: issue.message,
      })),
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({ error: "That email is already used" });
  }

  if (err.code === "23503") {
    return res.status(400).json({ error: "user_id does not exist" });
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
}

module.exports = { errorHandler };
