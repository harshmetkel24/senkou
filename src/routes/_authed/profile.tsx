import {
  ExperienceCard,
  ExperienceCardSkeleton,
} from "@/components/helpers/ExperienceCard";
import {
  StatCard,
  StatCardSkeleton,
  STATUS_ORDER,
  type WatchlistStats,
} from "@/components/helpers/ProfileAnalytics";
import {
  ProfileEditSheet,
  type ProfileDraft,
} from "@/components/helpers/ProfileEditSheet";
import {
  ProfileHero,
  ProfileHeroSkeleton,
  getUserInfoQueryKey,
} from "@/components/helpers/ProfileHero";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { updateUserFn } from "@/lib/server/user";
import { getWatchlistStatsFn } from "@/lib/server/watchlist";
import type { UserInfo } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookMarked } from "lucide-react";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const updateUser = useServerFn(updateUserFn);
  const getStats = useServerFn(getWatchlistStatsFn);
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    profileImg: null as string | null,
    experienceLevel: 0,
    bio: null as string | null,
    createdAt: null as Date | null,
  });

  const fullUserQueryKey = getUserInfoQueryKey(userId);

  const { data: stats, isLoading: statsLoading } =
    useQuery<WatchlistStats | null>({
      queryKey: ["watchlist-stats"],
      queryFn: () => getStats(),
      staleTime: 1000 * 60 * 5,
    });

  const handleUserLoaded = useCallback(
    (fullUser: UserInfo) => {
      if (editOpen) return;

      const nextProfile = {
        displayName: fullUser.displayName || "",
        email: fullUser.email || "",
        profileImg: fullUser.profileImg || null,
        experienceLevel: fullUser.experienceLevel ?? 0,
        bio: fullUser.bio ?? null,
        createdAt: fullUser.createdAt ?? null,
      };

      setProfileData((prev) => {
        if (
          prev.displayName === nextProfile.displayName &&
          prev.email === nextProfile.email &&
          prev.profileImg === nextProfile.profileImg &&
          prev.experienceLevel === nextProfile.experienceLevel &&
          prev.bio === nextProfile.bio &&
          prev.createdAt?.getTime() === nextProfile.createdAt?.getTime()
        ) {
          return prev;
        }

        return nextProfile;
      });
    },
    [editOpen]
  );

  const updateUserMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      displayName: string;
      email: string;
      profileImg: string | null;
      experienceLevel: number;
      bio: string | null;
    }) => {
      return await updateUser({ data: payload });
    },
    onSuccess: (response) => {
      if (!response?.success || !response.user) {
        toast.error("Profile update failed", {
          description: "Please try again in a moment.",
        });
        return;
      }

      const updatedUserInfo: UserInfo = {
        displayName: response.user.displayName || "",
        email: response.user.email || "",
        profileImg: response.user.profileImg || null,
        experienceLevel: response.user.experienceLevel ?? 0,
        bio: response.user.bio ?? null,
        createdAt: response.user.createdAt ?? null,
      };

      if (userId) {
        queryClient.setQueryData(
          fullUserQueryKey,
          (prev?: UserInfo | null) => ({
            ...(prev ?? {}),
            ...updatedUserInfo,
          })
        );
      }

      setProfileData(updatedUserInfo);
      setEditOpen(false);
      toast.success("Profile updated", {
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "Please try again in a moment.";
      toast.error("Profile update failed", { description });
    },
  });

  const handleSave = (draft: ProfileDraft) => {
    if (!userId || updateUserMutation.isPending) return;

    const trimmedDisplayName = draft.displayName.trim();
    const trimmedEmail = draft.email.trim();
    const trimmedBio = draft.bio?.trim() ?? "";

    if (!trimmedDisplayName || !trimmedEmail) {
      toast.error("Missing details", {
        description: "Display name and email cannot be empty.",
      });
      return;
    }

    if (trimmedBio.length > 128) {
      toast.error("Bio too long", {
        description: "Please keep it within 128 characters.",
      });
      return;
    }

    updateUserMutation.mutate({
      id: userId,
      displayName: trimmedDisplayName,
      email: trimmedEmail,
      profileImg: draft.profileImg,
      bio: trimmedBio.length ? trimmedBio : null,
      experienceLevel: Math.min(
        Math.max(Math.floor(draft.experienceLevel), 0),
        9
      ),
    });
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const isLoading = profileData.createdAt === null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-8 px-4">
      {/* Hero Banner */}
      <div className="animate-stagger-1">
        {isLoading && !profileData.displayName ? (
          <ProfileHeroSkeleton />
        ) : (
          <ProfileHero
            userId={userId}
            profileData={profileData}
            onEdit={() => {
              updateUserMutation.reset();
              setEditOpen(true);
            }}
            onUserLoaded={handleUserLoaded}
            onAvatarClick={() => {
              if (profileData.profileImg) setAvatarPreviewOpen(true);
            }}
          />
        )}
      </div>

      {/* Bento Grid: Experience + Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-stagger-2">
        {isLoading ? (
          <ExperienceCardSkeleton />
        ) : (
          <ExperienceCard level={profileData.experienceLevel} />
        )}

        {/* Anime Stats Summary Card */}
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-(--shadow-elevated)">
          <div className="flex items-center gap-2 mb-4">
            <BookMarked className="size-5 text-primary" />
            <h2 className="text-xl font-bold">Anime Stats</h2>
          </div>
          {statsLoading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-36 rounded bg-muted/40 animate-pulse" />
            </div>
          ) : !stats || stats.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <BookMarked className="size-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                No anime in your library yet.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Start adding anime to track your journey!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold tabular-nums tracking-[-0.02em] text-primary">
                  {stats.total}
                </span>
                <span className="text-sm text-muted-foreground">
                  Anime in Library
                </span>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                {STATUS_ORDER.slice(0, 3).map((status) => (
                  <span key={status} className="flex items-center gap-1">
                    <span className="font-bold text-foreground">
                      {stats[status]}
                    </span>{" "}
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="animate-stagger-3">
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : stats && stats.total > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STATUS_ORDER.map((status) => (
              <StatCard
                key={status}
                status={status}
                count={stats[status]}
                total={stats.total}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Edit Sheet */}
      <ProfileEditSheet
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) updateUserMutation.reset();
          setEditOpen(open);
        }}
        initialData={{
          displayName: profileData.displayName,
          email: profileData.email,
          profileImg: profileData.profileImg,
          experienceLevel: profileData.experienceLevel,
          bio: profileData.bio,
        }}
        onSave={handleSave}
        isSaving={updateUserMutation.isPending}
      />

      {/* Avatar Preview Dialog */}
      {profileData.profileImg && (
        <Dialog open={avatarPreviewOpen} onOpenChange={setAvatarPreviewOpen}>
          <DialogContent className="max-w-md p-2 bg-transparent border-none shadow-none">
            <img
              src={profileData.profileImg}
              alt={`Profile photo of ${profileData.displayName}`}
              className="w-full rounded-xl object-cover"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
