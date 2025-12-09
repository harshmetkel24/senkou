import {
  usersTable,
  type catalogEntitiesTable,
  type watchlistEntriesTable,
} from "@/db/schema";

// user
export type User = typeof usersTable.$inferSelect;
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
  | Pick<User, "id" | "email" | "displayName" | "profileImg">
  | undefined;

// watchlist
type CatalogEntityInsert = typeof catalogEntitiesTable.$inferInsert;
type WatchlistEntryInsert = typeof watchlistEntriesTable.$inferInsert;

export type AddWatchlistInput = Pick<
  CatalogEntityInsert,
  "anilistId" | "kind" | "title" | "format" | "coverImage" | "bannerImage"
> &
  Pick<WatchlistEntryInsert, "status" | "progress" | "notes" | "visibility">;

export type WatchListEntryKind = AddWatchlistInput["kind"];
export type WatchListEntryProgress = AddWatchlistInput["progress"];
