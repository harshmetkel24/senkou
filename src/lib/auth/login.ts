import { authenticateUser } from "@/lib/auth";
import { useAppSession } from "@/lib/auth/session";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    // Verify credentials (replace with your auth logic)
    const user = await authenticateUser(data.email, data.password);

    if (!user) {
      return { error: "Invalid credentials" };
    }

    // Create session
    const session = await useAppSession();
    await session.update({
      userId: user.id,
      email: user.email,
    });

    // Redirect to protected area
    throw redirect({ to: "/" });
  });

// Logout server function
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: "/" });
});
