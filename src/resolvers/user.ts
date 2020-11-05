import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { hash, verify } from "argon2";

import { MyContext } from "../types";
import { User } from "../entities/";
import { COOKIE_NAME, INVALID_CREDENTAILS } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field({ nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse | null> {
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username can't be less than 3 characters",
          },
        ],
      };
    }
    if (password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "password can't be less than 3 characters",
          },
        ],
      };
    }
    const hashedPassword = await hash(password);
    const user = em.create(User, { username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      // 23505 code for already exists in mikro orm
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }
    }

    // store user id session
    // login the user
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg("options") { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username });
    if (!user)
      return {
        errors: [{ field: "username", message: INVALID_CREDENTAILS }],
      };

    const hashedPassword = await verify(user.password, password);
    if (!hashedPassword)
      return {
        errors: [{ field: "password", message: INVALID_CREDENTAILS }],
      };

    req.session.userId = user.id;

    return { user };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req, em }: MyContext): Promise<User | null> | null {
    const id = req.session.userId;
    if (!id) return null;
    return em.findOne(User, { id });
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log("\n\n>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<\n\n");
          console.log(err);
          console.log("\n\n>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<\n\n");

          resolve(false);
        }

        resolve(true);
      })
    );
  }
}
