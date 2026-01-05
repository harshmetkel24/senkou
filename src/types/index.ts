import {
  usersTable,
  type catalogEntitiesTable,
  type watchlistEntriesTable,
} from "@/db/schema";

// user
export type User = typeof usersTable.$inferSelect;
export type UserInfo = Pick<
  User,
  "email" | "displayName" | "profileImg" | "experienceLevel" | "bio"
>;
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

// FIXME: make this object as Light weight as possible. We may remove email, displayName also from this context
export type AuthContextType =
  | Pick<User, "id" | "email" | "displayName">
  | undefined;

// watchlist
type CatalogEntityInsert = typeof catalogEntitiesTable.$inferInsert;
type WatchlistEntryInsert = typeof watchlistEntriesTable.$inferInsert;
export type WatchlistEntry = typeof watchlistEntriesTable.$inferSelect;
export type WatchlistEntity = typeof catalogEntitiesTable.$inferSelect;

export type AddWatchlistInput = Pick<
  CatalogEntityInsert,
  "anilistId" | "kind" | "title" | "format" | "coverImage" | "bannerImage"
> &
  Pick<WatchlistEntryInsert, "status" | "progress" | "notes" | "visibility">;

export type WatchListEntryKind = AddWatchlistInput["kind"];
export type WatchListEntryProgress = AddWatchlistInput["progress"];
export type WatchStatus = WatchlistEntry["status"];

export type UpdateWatchlistStatusInput = Pick<WatchlistEntry, "status"> & {
  entryId: WatchlistEntry["id"];
};

export type RemoveWatchlistEntryInput = {
  entryId: WatchlistEntry["id"];
};
