import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  // WIP: add trigger to update on row update
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Future-ready additions to revisit:
// - OAuth identities (provider/providerUserId) and email verification timestamps.
// - Profile fields like avatar, bio, locale/timezone, and theme/content-rating preferences.
// - Audit/abuse controls: lastSignedInAt, suspendedAt, rate-limit counters for actions.
