// utils/session.ts
import type { SessionData } from "@/types";
import { useSession } from "@tanstack/react-start/server";

export function useAppSession() {
  return useSession<SessionData>({
    // Session configuration
    name: "app-session",
    password: process.env.SESSION_SECRET!, // At least 32 characters
    // REVIEW: Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
  });
}
