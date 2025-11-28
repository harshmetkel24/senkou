import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { useAppSession } from "@/lib/auth/session";
import { RegisterUserData } from "@/types";
import bcrypt from "bcryptjs";

import { SALT_ROUNDS } from "@/lib/auth/constant";
import { createServerFn } from "@tanstack/react-start";

export const registerUser = createServerFn({
  method: "POST",
})
  .inputValidator((data: RegisterUserData) => data)
  .handler(async ({ data }) => {
    try {
      const { email, password, displayName } = data;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const userData = {
        email,
        displayName,
        passwordHash: hashedPassword,
      };

      const [insertedUser] = await db
        .insert(usersTable)
        .values(userData)
        .returning();

      const session = await useAppSession();
      await session.update({
        userId: insertedUser.id,
        email: insertedUser.email,
      });
      return {
        message: {
          type: "success",
        },
        user: insertedUser,
      };
    } catch (error) {
      console.error("Error signing up user:", error);
      throw error;
    }
  });
