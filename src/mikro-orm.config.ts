import "dotenv/config";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

import { __prod__ } from "./constants";
import { DATABASE_NAME, DATABASE_PASSWORD, DATABASE_USER } from "./environment";
import { Post, User } from "./entities";

export default {
  dbName: DATABASE_NAME,
  debug: !__prod__,
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to folder with migrations
    pattern: /^[\w-]+\d+\.[jt]s$/
  },
  password: DATABASE_PASSWORD,
  type: "postgresql",
  user: DATABASE_USER,
} as Parameters<typeof MikroORM.init>[0];
