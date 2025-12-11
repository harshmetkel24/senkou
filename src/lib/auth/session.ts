// utils/session.ts
import type { SessionData } from "@/types";
import { useSession } from "@tanstack/react-start/server";

export function useAppSession(rememberMe?: boolean) {
  return useSession<SessionData>({
    // Session configuration
    name: "app-session",
    password: process.env.SESSION_SECRET!, // At least 32 characters
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // rememberMe = true => 30 days else 1 day
    // REVIEW: Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  });
}
