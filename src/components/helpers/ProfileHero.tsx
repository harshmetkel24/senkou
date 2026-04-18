import {
  ProfileAvatar,
  getUserInfoQueryKey,
} from "@/components/helpers/ProfileAvatar";
import { ExperienceBadge } from "@/components/helpers/experience-badge";
import { Button } from "@/components/ui/button";
import { getExperienceLevelInfo } from "@/lib/constants/experience-levels";
import type { UserInfo } from "@/types";
import { Edit } from "lucide-react";

type ProfileHeroProps = {
  userId?: number;
  profileData: {
    displayName: string;
    email: string;
    profileImg: string | null;
    experienceLevel: number;
    bio: string | null;
    createdAt: Date | null;
  };
  onEdit: () => void;
  onUserLoaded: (user: UserInfo) => void;
  onAvatarClick: () => void;
};

export function ProfileHero({
  userId,
  profileData,
  onEdit,
  onUserLoaded,
  onAvatarClick,
}: ProfileHeroProps) {
  const experienceInfo = getExperienceLevelInfo(profileData.experienceLevel);
  const isLoading = profileData.createdAt === null;
  const canPreviewAvatar = Boolean(profileData.profileImg);

  const formatJoinedSince = (value?: Date | string | null) => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return `Joined ${new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed)}`;
  };

  const joinedText = formatJoinedSince(profileData.createdAt);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card bg-linear-to-br from-primary/5 via-transparent to-accent/5 shadow-(--shadow-soft)">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8 sm:p-12">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Button
            type="button"
            variant="icon"
            className="group relative size-auto rounded-full p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-card disabled:cursor-default disabled:opacity-100"
            onClick={onAvatarClick}
            aria-label={
              canPreviewAvatar
                ? "Open profile photo preview"
                : "Profile avatar"
            }
            disabled={!canPreviewAvatar}
          >
            <div className="rounded-full ring-[3px] ring-primary/60 ring-offset-4 ring-offset-card transition-all duration-200 group-hover:ring-primary group-hover:scale-105">
              <ProfileAvatar
                userId={userId}
                draftImage={profileData.profileImg}
                fallbackInitial={profileData.displayName}
                size={96}
                onUserLoaded={onUserLoaded}
              />
            </div>
            {isLoading ? (
              <div
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-muted/40 animate-pulse ring-2 ring-card"
                aria-hidden="true"
              />
            ) : (
              <ExperienceBadge
                level={profileData.experienceLevel}
                className="absolute -bottom-1 -right-1"
              />
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-7 w-48 rounded bg-muted/50 animate-pulse mx-auto sm:mx-0" />
              <div className="h-4 w-36 rounded bg-muted/40 animate-pulse mx-auto sm:mx-0" />
              <div className="h-3.5 w-52 rounded bg-muted/30 animate-pulse mx-auto sm:mx-0" />
            </div>
          ) : (
            <>
              <h1
                className="text-[28px] font-bold leading-[1.15] text-foreground truncate"
                style={{ fontFamily: '"DynaPuff", sans-serif' }}
              >
                {profileData.displayName}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-1.5">
                <p className="text-sm font-bold text-foreground">
                  Level {experienceInfo.level + 1}: {experienceInfo.title}
                </p>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {experienceInfo.subtitle}
                </span>
              </div>
              {joinedText && (
                <p className="text-xs text-muted-foreground mt-1">
                  {joinedText}
                </p>
              )}
              {profileData.bio ? (
                <p className="text-sm text-foreground/90 leading-relaxed mt-3 line-clamp-2">
                  {profileData.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-3">
                  No bio yet — tell the world about your anime taste.
                </p>
              )}
            </>
          )}
        </div>

        {/* Edit button */}
        <div className="shrink-0 sm:self-start">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="size-4" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-8 sm:p-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="size-24 rounded-full bg-muted/40 animate-pulse shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 rounded bg-muted/50 animate-pulse mx-auto sm:mx-0" />
          <div className="h-4 w-36 rounded bg-muted/40 animate-pulse mx-auto sm:mx-0" />
          <div className="h-3.5 w-52 rounded bg-muted/30 animate-pulse mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );
}

export { getUserInfoQueryKey };
