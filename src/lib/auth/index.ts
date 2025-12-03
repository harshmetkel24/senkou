import { useAppSession } from "@/lib/auth/session";
import { getUserByEmail, getUserById } from "@/lib/server/user";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
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

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("User with this email does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  return isPasswordValid ? user : null;
}
