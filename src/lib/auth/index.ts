import { createServerFn } from "@tanstack/react-start";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { useAppSession } from "@/lib/auth/session";
import type { User } from "@/types";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// Get current user
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession();
    const userId = session.data.userId;

    if (!userId) {
      return null;
    }

    return await getUserById(userId);
  }
);

async function getUserById(id: User["id"]) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
  });
  return user || null;
}

export async function getUserByEmail(email: User["email"]) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  return user || null;
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User with this email does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  return isPasswordValid ? user : null;
}
