import { useAppSession } from "@/lib/auth/session";
import { resolveProfileImageUrl } from "@/lib/storage/avatar";
import { uploadProfileImageFromDataUrl } from "@/lib/storage/minio";
import type { User } from "@/types";
import { createServerFn } from "@tanstack/react-start";

type UpdateUserType = Pick<
  User,
  "id" | "displayName" | "email" | "profileImg"
> &
  Partial<Pick<User, "experienceLevel" | "bio">>;

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

      let nextBio = userQueried.bio;
      let nextProfileImg = userQueried.profileImg ?? null;

      if (data.bio !== undefined) {
        if (data.bio === null) {
          nextBio = null;
        } else {
          const trimmedBio = data.bio.trim();
          if (trimmedBio.length > 128) {
            throw new Error("Bio must be 128 characters or less");
          }
          nextBio = trimmedBio.length ? trimmedBio : null;
        }
      }

      if (typeof data.profileImg === "string") {
        const trimmedImage = data.profileImg.trim();
        if (!trimmedImage.length) {
          nextProfileImg = null;
        } else if (trimmedImage.startsWith("data:")) {
          const uploadResult = await uploadProfileImageFromDataUrl({
            dataUrl: trimmedImage,
            userId: data.id,
          });
          nextProfileImg = uploadResult.url;
        } else {
          nextProfileImg = trimmedImage;
        }
      } else if (data.profileImg === null) {
        nextProfileImg = null;
      }

      const [updatedUser] = await db
        .update(usersTable)
        .set({
          email: data.email,
          displayName: data.displayName,
          profileImg: nextProfileImg,
          experienceLevel: data.experienceLevel ?? userQueried.experienceLevel,
          bio: nextBio,
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
          profileImg: resolveProfileImageUrl(updatedUser.profileImg),
          experienceLevel: updatedUser.experienceLevel,
          bio: updatedUser.bio,
          createdAt: updatedUser.createdAt,
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      console.error("Error updating user:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update profile. Please try again.";
      throw new Error(message);
    }
  });

export const getUserInfo = createServerFn({ method: "GET" })
  .inputValidator((id: User["id"]) => id)
  .handler(async ({ data: id }) => {
    try {
      const user = await getUserById(id);
      if (!user) {
        throw new Error("User not found");
      }
      const fullUser = {
        email: user.email,
        displayName: user.displayName,
        profileImg: resolveProfileImageUrl(user.profileImg),
        experienceLevel: user.experienceLevel,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return {
        success: true,
        user: fullUser,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
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
