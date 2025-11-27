import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { useAppSession } from "@/lib/auth/session";
import { User } from "@/types";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

type UserSignUpData = Omit<User, "id">;

export const signUpUser = createServerFn({ method: "POST" })
  .inputValidator((data: UserSignUpData) => data)
  .handler(async ({ data }) => {
    try {
      // WIP - replace with proper password hashing
      const [insertedUser] = await db
        .insert(usersTable)
        .values(data)
        .returning();
      console.log("User signed up successfully!");
      const session = await useAppSession();
      await session.update({
        userId: insertedUser.id,
        email: insertedUser.email,
      });
      throw redirect({ to: "/" });
    } catch (error) {
      console.error("Error signing up user:", error);
      throw error;
    }
  });
