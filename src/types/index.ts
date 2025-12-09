import { usersTable } from "@/db/schema";

// user
export type User = typeof usersTable.$inferSelect;
export type UserInfo = Pick<User, "email" | "displayName" | "profileImg">;
export type UserWithoutSensitiveInfo = Omit<
  typeof usersTable.$inferInsert,
  "passwordHash" | "id"
> & {
  password: string;
};

// session
export type SessionData = {
  userId: User["id"];
  email: User["email"];
};

export type AuthContextType =
  | Pick<User, "id" | "email" | "displayName">
  | undefined;
