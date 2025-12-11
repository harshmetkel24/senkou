import { SALT_ROUNDS } from "@/lib/auth/constant";
import { useAppSession } from "@/lib/auth/session";
import {
  displayNameSchema,
  emailSchema,
  passwordSchema,
} from "@/lib/auth/validation";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerInputSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

type RegisterInput = z.infer<typeof registerInputSchema>;

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator((data: RegisterInput) => registerInputSchema.parse(data))
  .handler(async ({ data }) => {
    const [{ getUserByEmail }, { db }, { usersTable }] = await Promise.all([
      import("@/lib/server/user"),
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
      await session.update({
        userId: insertedUser.id,
        email: insertedUser.email,
      });

      return {
        success: true,
        user: { id: insertedUser.id, email: insertedUser.email },
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  });
