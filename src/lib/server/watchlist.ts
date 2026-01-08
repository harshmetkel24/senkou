import { entityKindEnum, visibilityEnum, watchStatusEnum } from "@/db/schema";
import { useAppSession } from "@/lib/auth/session";
import {
  AddWatchlistInput,
  RemoveWatchlistEntryInput,
  UpdateWatchlistStatusInput,
} from "@/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const addWatchlistInputSchema: z.ZodType<AddWatchlistInput> = z.object({
  anilistId: z.number().int().positive(),
  kind: z.enum(entityKindEnum.enumValues),
  title: z.string().trim().min(1, "Title is required").max(300),
  format: z.string().trim().max(50).nullish(),
  coverImage: z
    .string()
    .trim()
    .max(512)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  bannerImage: z
    .string()
    .trim()
    .max(512)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  status: z.enum(watchStatusEnum.enumValues).default("PLANNING"),
  progress: z.number().int().min(0).default(0),
  notes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  visibility: z.enum(visibilityEnum.enumValues).default("PRIVATE"),
});

const updateWatchlistStatusSchema: z.ZodType<UpdateWatchlistStatusInput> =
  z.object({
    entryId: z.number().int().positive(),
    status: z.enum(watchStatusEnum.enumValues),
  });

const removeWatchlistEntrySchema: z.ZodType<RemoveWatchlistEntryInput> =
  z.object({
    entryId: z.number().int().positive(),
  });

export const addToWatchlistFn = createServerFn({ method: "POST" })
  .inputValidator((data: AddWatchlistInput) =>
    addWatchlistInputSchema.parse(data)
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const userId = session.data.userId;

    if (!userId) {
      throw new Error("You must be signed in to manage your watchlist.");
    }

    const [
      { db },
      { catalogEntitiesTable, watchlistEntriesTable },
      { and, eq, sql },
    ] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

    try {
      const normalizedEntityValues = {
        anilistId: data.anilistId,
        kind: data.kind,
        title: data.title,
        format: data.format ?? null,
        coverImage: data.coverImage ?? null,
        bannerImage: data.bannerImage ?? null,
      };

      const [insertedEntity] = await db
        .insert(catalogEntitiesTable)
        .values(normalizedEntityValues)
        .onConflictDoUpdate({
          target: [catalogEntitiesTable.anilistId, catalogEntitiesTable.kind],
          set: {
            ...normalizedEntityValues,
            updatedAt: sql`NOW()`,
          },
        })
        .returning();

      const [insertedEntry] = await db
        .insert(watchlistEntriesTable)
        .values({
          userId,
          entityId: insertedEntity.id,
          status: data.status,
          progress: data.progress,
          notes: data.notes,
          visibility: data.visibility,
        })
        .onConflictDoNothing()
        .returning();

      if (insertedEntry) {
        return {
          success: true,
          entry: insertedEntry,
          entity: insertedEntity,
        };
      }

      const existingEntry = await db.query.watchlistEntriesTable.findFirst({
        where: and(
          eq(watchlistEntriesTable.userId, userId),
          eq(watchlistEntriesTable.entityId, insertedEntity.id)
        ),
      });

      if (!existingEntry) {
        throw new Error("Failed to add to watchlist. Please retry.");
      }

      return {
        success: true,
        entry: existingEntry,
        entity: insertedEntity,
        alreadyExists: true,
      };
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  });

export const getWatchlistFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession();
    const userId = session.data.userId;

    if (!userId) {
      return [];
    }

    const [
      { db },
      { catalogEntitiesTable, watchlistEntriesTable },
      { eq, sql },
    ] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

    const rows = await db
      .select({
        entry: watchlistEntriesTable,
        entity: catalogEntitiesTable,
      })
      .from(watchlistEntriesTable)
      .innerJoin(
        catalogEntitiesTable,
        eq(watchlistEntriesTable.entityId, catalogEntitiesTable.id)
      )
      .where(eq(watchlistEntriesTable.userId, userId))
      .orderBy(sql`${watchlistEntriesTable.updatedAt} DESC`)
      .limit(24);

    return rows;
  }
);

export const updateWatchlistStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateWatchlistStatusInput) =>
    updateWatchlistStatusSchema.parse(data)
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const userId = session.data.userId;

    if (!userId) {
      throw new Error("You must be signed in to manage your watchlist.");
    }

    const [
      { db },
      { watchlistEntriesTable },
      { and, eq, sql },
    ] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

    try {
      const [updatedEntry] = await db
        .update(watchlistEntriesTable)
        .set({
          status: data.status,
          updatedAt: sql`NOW()`,
        })
        .where(
          and(
            eq(watchlistEntriesTable.id, data.entryId),
            eq(watchlistEntriesTable.userId, userId)
          )
        )
        .returning();

      if (!updatedEntry) {
        throw new Error("Watchlist entry not found.");
      }

      return updatedEntry;
    } catch (error) {
      console.error("Error updating watchlist status:", error);
      throw error;
    }
  });

export const getWatchlistStatsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession();
    const userId = session.data.userId;

    if (!userId) {
      return null;
    }

    const [{ db }, { watchlistEntriesTable }, { eq, sql, count }] =
      await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("drizzle-orm"),
      ]);

    const statusCounts = await db
      .select({
        status: watchlistEntriesTable.status,
        count: count(),
      })
      .from(watchlistEntriesTable)
      .where(eq(watchlistEntriesTable.userId, userId))
      .groupBy(watchlistEntriesTable.status);

    const stats = {
      PLANNING: 0,
      WATCHING: 0,
      COMPLETED: 0,
      PAUSED: 0,
      DROPPED: 0,
      total: 0,
    };

    for (const row of statusCounts) {
      if (row.status in stats) {
        stats[row.status as keyof typeof stats] = row.count;
      }
      stats.total += row.count;
    }

    return stats;
  }
);

export const removeFromWatchlistFn = createServerFn({ method: "POST" })
  .inputValidator((data: RemoveWatchlistEntryInput) =>
    removeWatchlistEntrySchema.parse(data)
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const userId = session.data.userId;

    if (!userId) {
      throw new Error("You must be signed in to manage your watchlist.");
    }

    const [
      { db },
      { watchlistEntriesTable },
      { and, eq },
    ] = await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

    try {
      const [removedEntry] = await db
        .delete(watchlistEntriesTable)
        .where(
          and(
            eq(watchlistEntriesTable.id, data.entryId),
            eq(watchlistEntriesTable.userId, userId)
          )
        )
        .returning();

      if (!removedEntry) {
        throw new Error("Watchlist entry not found or already removed.");
      }

      return { success: true, entryId: removedEntry.id };
    } catch (error) {
      console.error("Error removing watchlist entry:", error);
      throw error;
    }
  });
