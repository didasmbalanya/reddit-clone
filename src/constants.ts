const { NODE_ENV } = process.env;

export const __prod__ = NODE_ENV === "production";

export const INVALID_CREDENTAILS = "Invalid credentials";
export const COOKIE_NAME = "qid";
