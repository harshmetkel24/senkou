import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  experienceLevel: integer("experience_level").notNull().default(0),
  bio: text("bio"),
  // HACK: using base64 encoded strings for profile images for simplicity.
  // In future, consider migrating to dedicated file storage (e.g., S3)
  // and change it to profileImageUrl
  profileImg: text("profile_img"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  // IDEA: add trigger to update on row update
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Future-ready additions to revisit:
// - OAuth identities (provider/providerUserId) and email verification timestamps.
// - Profile fields like avatar, bio, locale/timezone, and theme/content-rating preferences.
// - Audit/abuse controls: lastSignedInAt, suspendedAt, rate-limit counters for actions.

export const entityKindEnum = pgEnum("entity_kind", ["ANIME", "MANGA"]);
export const watchStatusEnum = pgEnum("watch_status", [
  "PLANNING",
  "WATCHING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
]);

// IDEA: implement Friends Only visibility as well in future
// WIP: right now by default only one visiblity level: PRIVATE
export const visibilityEnum = pgEnum("visibility", [
  "PRIVATE",
  "UNLISTED",
  "PUBLIC",
]);

export const catalogEntitiesTable = pgTable(
  "catalog_entities",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    anilistId: integer("anilist_id").notNull(),
    kind: entityKindEnum("kind").notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    format: varchar("format", { length: 50 }),
    coverImage: varchar("cover_image", { length: 512 }),
    bannerImage: varchar("banner_image", { length: 512 }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("catalog_entities_kind_idx").on(table.kind),
    uniqueIndex("catalog_entities_anilist_kind_uniq").on(
      table.anilistId,
      table.kind
    ),
  ]
);

export const watchlistEntriesTable = pgTable(
  "watchlist_entries",
  {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    entityId: integer("entity_id")
      .references(() => catalogEntitiesTable.id, { onDelete: "cascade" })
      .notNull(),
    status: watchStatusEnum("status").notNull().default("PLANNING"),
    progress: integer("progress").notNull().default(0),
    notes: text("notes"),
    visibility: visibilityEnum("visibility").notNull().default("PRIVATE"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("watchlist_user_status_idx").on(table.status),
    uniqueIndex("watchlist_user_entity_uniq").on(table.userId, table.entityId),
  ]
);
