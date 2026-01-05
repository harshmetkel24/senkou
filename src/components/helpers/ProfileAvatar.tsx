import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Image } from "@unpic/react";
import { Component, ReactNode, Suspense, useEffect, useMemo } from "react";

import { getUserInfo } from "@/lib/server/user";
import type { UserInfo } from "@/types";

export type ProfileAvatarProps = {
  userId?: number;
  fallbackInitial?: string;
  draftImage?: string | null;
  onUserLoaded?: (user: UserInfo) => void;
};

export const getUserInfoQueryKey = (userId?: number) =>
  ["user", "info", userId ?? "current"] as const;

export function ProfileAvatar({
  userId,
  fallbackInitial,
  draftImage,
  onUserLoaded,
}: ProfileAvatarProps) {
  if (!userId) {
    return <ProfileAvatarFallback initial={fallbackInitial} />;
  }

  return (
    <AvatarErrorBoundary
      fallback={<ProfileAvatarFallback initial={fallbackInitial} />}
    >
      <Suspense fallback={<ProfileAvatarFallback initial={fallbackInitial} />}>
        <ProfileAvatarContent
          userId={userId}
          draftImage={draftImage}
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
  fallbackInitial,
  onUserLoaded,
}: Required<Pick<ProfileAvatarProps, "userId">> &
  Omit<ProfileAvatarProps, "userId">) {
  const fetchUserInfo = useServerFn(getUserInfo);
  const queryKey = useMemo(() => getUserInfoQueryKey(userId), [userId]);

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
    return <ProfileAvatarFallback initial={fallbackInitial} />;
  }

  return (
    <Image
      src={profileImg}
      alt="Profile"
      className="size-28 rounded-full object-cover shadow-lg"
      width={116}
      height={112}
      loading="lazy"
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

export function ProfileAvatarFallback({ initial }: { initial?: string }) {
  const letter = initial?.charAt(0).toUpperCase() || "U";
  return (
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-lg">
      {letter}
    </div>
  );
}
