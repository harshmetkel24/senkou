import { useAppSession } from "@/lib/auth/session";
import type { User } from "@/types";
import { createServerFn } from "@tanstack/react-start";

type UpdateUserType = Pick<User, "id" | "displayName" | "email">;

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateUserType) => data)
  .handler(async ({ data }) => {
    try {
      if (!data) {
        throw new Error("Invalid Input");
      }

      const session = await useAppSession();

      if (data.id !== session.data.userId) {
        throw new Error("Unathorized update, not allowed");
      }

      const userQueried = await getUserById(data.id);

      if (!userQueried) {
        throw new Error("User doesn't exist");
      }

      const [{ db }, { usersTable }, { eq, sql }] = await Promise.all([
        import("@/db"),
        import("@/db/schema"),
        import("drizzle-orm"),
      ]);

      const [updatedUser] = await db
        .update(usersTable)
        .set({
          email: data.email,
          displayName: data.displayName,
          profileImg: data.profileImg,
          updatedAt: sql`NOW()`,
        })
        .where(eq(usersTable.id, data.id))
        .returning();

      await session.update({
        userId: updatedUser.id,
        email: updatedUser.email,
      });

      return {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          profileImg: updatedUser.profileImg,
        },
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  });

export async function getUserById(id: User["id"]) {
  const [{ db }, { usersTable }, { eq }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
    import("drizzle-orm"),
  ]);

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
  });
  return user || null;
}

export async function getUserByEmail(email: User["email"]) {
  const [{ db }, { usersTable }, { eq }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
    import("drizzle-orm"),
  ]);

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  return user || null;
}
