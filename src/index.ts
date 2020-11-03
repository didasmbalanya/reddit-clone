import "dotenv/config";
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { PORT } from "./environment";
import { PostResolver, UserResolver } from "./resolvers/";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),

    context: () => ({ em: orm.em }),
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
