import { SALT_ROUNDS } from "@/lib/auth/constant";
import { useAppSession } from "@/lib/auth/session";
import type { UserWithoutSensitiveInfo } from "@/types";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator((data: UserWithoutSensitiveInfo) => data)
  .handler(async ({ data }) => {
    const [{ getUserByEmail }, { db }, { usersTable }] = await Promise.all([
      import("@/lib/auth"),
      import("@/db"),
      import("@/db/schema"),
    ]);

    try {
      const { email, displayName, password } = data;

      const userWithEmail = await getUserByEmail(email);
      if (userWithEmail) {
        throw new Error("A user with this email already exists.");
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const [insertedUser] = await db
        .insert(usersTable)
        .values({
          email,
          displayName,
          passwordHash: hashedPassword,
        })
        .returning();

      // Create session
      const session = await useAppSession();
      await session.update({ userId: insertedUser.id });

      return {
        success: true,
        user: { id: insertedUser.id, email: insertedUser.email },
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  });
