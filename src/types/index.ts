import { usersTable } from "@/db/schema";

// session
export type SessionData = {
  userId: number;
  email: string;
};
export type AuthContextType = {
  user?: User | null;
  // REVIEW: required? how to implement?
  isLoading: boolean;
  refetch: () => Promise<User | null>;
};

// user
export type User = typeof usersTable.$inferSelect;
export type RegisterUserData = Omit<
  typeof usersTable.$inferInsert,
  "passwordHash"
> & { password: string };
