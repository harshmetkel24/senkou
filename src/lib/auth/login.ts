import { authenticateUser } from "@/lib/auth";
import { useAppSession } from "@/lib/auth/session";
import { createServerFn } from "@tanstack/react-start";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await authenticateUser(data.email, data.password);

      if (!user) {
        throw new Error("Invalid Credentials");
      }

      // Create session
      const session = await useAppSession();
      await session.update({ userId: user.id });

      return {
        success: true,
        user: { id: user.id, email: user.email },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  });
