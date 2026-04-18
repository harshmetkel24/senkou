import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Component, ReactNode, Suspense, useEffect } from "react";

import { getUserInfo } from "@/lib/server/user";
import type { UserInfo } from "@/types";

export type ProfileAvatarProps = {
  userId?: number;
  fallbackInitial?: string;
  draftImage?: string | null;
  size?: number;
  onClick?: () => void;
  onUserLoaded?: (user: UserInfo) => void;
};

export const getUserInfoQueryKey = (userId?: number) =>
  ["user", "info", userId ?? "current"] as const;

export function ProfileAvatar({
  userId,
  fallbackInitial,
  draftImage,
  size = 96,
  onClick,
  onUserLoaded,
}: ProfileAvatarProps) {
  if (!userId) {
    return <ProfileAvatarFallback initial={fallbackInitial} size={size} onClick={onClick} />;
  }

  return (
    <AvatarErrorBoundary
      fallback={<ProfileAvatarFallback initial={fallbackInitial} size={size} onClick={onClick} />}
    >
      <Suspense fallback={<ProfileAvatarFallback initial={fallbackInitial} size={size} onClick={onClick} />}>
        <ProfileAvatarContent
          userId={userId}
          draftImage={draftImage}
          size={size}
          onClick={onClick}
          fallbackInitial={fallbackInitial}
          onUserLoaded={onUserLoaded}
        />
      </Suspense>
    </AvatarErrorBoundary>
  );
}

function ProfileAvatarContent({
  userId,
  draftImage,
  size = 96,
  onClick,
  fallbackInitial,
  onUserLoaded,
}: Required<Pick<ProfileAvatarProps, "userId">> &
  Omit<ProfileAvatarProps, "userId">) {
  const fetchUserInfo = useServerFn(getUserInfo);
  const queryKey = getUserInfoQueryKey(userId);

  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetchUserInfo({ data: userId });
      if (!response?.success || !response.user) {
        throw new Error("Unable to load your profile right now.");
      }
      return response.user;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      onUserLoaded?.(data);
    }
  }, [data, onUserLoaded]);

  const profileImg = draftImage ?? data?.profileImg;

  if (!profileImg) {
    return <ProfileAvatarFallback initial={fallbackInitial} size={size} onClick={onClick} />;
  }

  return (
    <img
      src={profileImg}
      alt="Profile"
      className="rounded-full object-cover shadow-lg"
      style={{ width: size, height: size }}
      width={size}
      height={size}
      loading="lazy"
      onClick={onClick}
      aria-label={onClick ? "Open profile photo preview" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    />
  );
}

class AvatarErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state: { hasError: boolean } = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Failed to load profile avatar", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function ProfileAvatarFallback({
  initial,
  size = 96,
  onClick,
}: {
  initial?: string;
  size?: number;
  onClick?: () => void;
}) {
  const letter = initial?.charAt(0).toUpperCase() || "U";
  return (
    <div
      className="rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shadow-lg"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      onClick={onClick}
      aria-label={onClick ? "Open profile photo preview" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {letter}
    </div>
  );
}
