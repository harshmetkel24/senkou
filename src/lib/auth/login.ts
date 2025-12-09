import { useAppSession } from "@/lib/auth/session";
import { createServerFn } from "@tanstack/react-start";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { authenticateUser } = await import("@/lib/auth");

    try {
      const user = await authenticateUser(data.email, data.password);

      if (!user) {
        throw new Error("Invalid Credentials");
      }

      // Create session
      const session = await useAppSession();
      await session.update({ userId: user.id, email: user.email });

      return {
        success: true,
        user: { id: user.id, email: user.email },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  });

// Logout server function
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const { useAppSession } = await import("@/lib/auth/session");
    const session = await useAppSession();
    await session.clear();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to log out");
  }
});
