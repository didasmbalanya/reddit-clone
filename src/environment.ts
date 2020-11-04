/**
 * Distracture from .env and add default values
 */
export const {
  DATABASE_NAME = "postgres",
  DATABASE_USER = "postgres",
  DATABASE_PASSWORD = "postgres",
  PORT = 5000,
  SESSION_SECRET = "sessionsecret"
} = process.env;

