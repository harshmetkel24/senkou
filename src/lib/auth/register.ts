import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { SALT_ROUNDS } from "@/lib/auth/constant";
import { useAppSession } from "@/lib/auth/session";
import type { UserWithoutSensitiveInfo } from "@/types";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator((data: UserWithoutSensitiveInfo) => data)
  .handler(async ({ data }) => {
    try {
      const { password } = data;

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const [insertedUser] = await db
        .insert(usersTable)
        .values({
          email: data.email,
          passwordHash: hashedPassword,
          displayName: data.displayName,
        })
        .returning();

      console.log("Registration scuessful ✅");
      console.log("Inserted User:", insertedUser);

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
