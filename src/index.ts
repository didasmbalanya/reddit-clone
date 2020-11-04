import "dotenv/config";
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { PORT, SESSION_SECRET } from "./environment";
import { PostResolver, UserResolver } from "./resolvers/";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        sameSite: "lax",
        secure: __prod__, // work only on prod ie https,
      },
      name: "qid",
      resave: false,
      saveUninitialized: false,
      secret: SESSION_SECRET,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),

    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () =>
    console.log(
      "\n ===========================================\n",
      `server running on port ${PORT}`,
      "\n ==========================================="
    )
  );
};

main().catch((error) => {
  console.log(" \n\n <<<<<<<<<< main error >>>>>>>>>>>>>>>> \n\n");
  console.error(error);
  console.log(" \n\n <<<<<<<<<<>>>>>>>>>>>>>>>> \n\n");
});
