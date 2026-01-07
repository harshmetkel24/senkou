import {
  ProfileAvatar,
  getUserInfoQueryKey,
} from "@/components/helpers/ProfileAvatar";
import { ExperienceBadge } from "@/components/helpers/experience-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { getExperienceLevelInfo } from "@/lib/constants/experience-levels";
import { updateUserFn } from "@/lib/server/user";
import type { UserInfo } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Edit, Save, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const updateUser = useServerFn(updateUserFn);
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(() => ({
    displayName: user?.displayName || "",
    email: user?.email || "",
    profileImg: null as string | null,
    experienceLevel: 0,
    bio: null as string | null,
    createdAt: null as Date | null,
  }));
  const [draftData, setDraftData] = useState(profileData);
  const fullUserQueryKey = getUserInfoQueryKey(userId);

  const formatJoinedSince = (value?: Date | string | null) => {
    if (!value) return "—";
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  };

  const handleUserLoaded = (fullUser: UserInfo) => {
    if (editMode) return;
    const nextProfile = {
      displayName: fullUser.displayName || "",
      email: fullUser.email || "",
      profileImg: fullUser.profileImg || null,
      experienceLevel: fullUser.experienceLevel ?? 0,
      bio: fullUser.bio ?? null,
      createdAt: fullUser.createdAt ?? null,
    };
    setProfileData(nextProfile);
    setDraftData(nextProfile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 256 * 1024) {
      toast.error("File too large", {
        description: "Max allowed size is 256KB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setDraftData({ ...draftData, profileImg: base64 });
    };
    reader.readAsDataURL(file);
  };

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

      const nextProfile = updatedUserInfo;

      setProfileData(nextProfile);
      setDraftData(nextProfile);
      setEditMode(false);
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

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const activeExperienceLevel = editMode
    ? draftData.experienceLevel
    : profileData.experienceLevel;
  const experienceInfo = getExperienceLevelInfo(activeExperienceLevel);
  const draftExperienceInfo = getExperienceLevelInfo(draftData.experienceLevel);
  const showExperienceLoading = !editMode && profileData.createdAt === null;

  const handleSave = () => {
    if (!userId || updateUserMutation.isPending) return;

    const trimmedDisplayName = draftData.displayName.trim();
    const trimmedEmail = draftData.email.trim();
    const trimmedBio = draftData.bio?.trim() ?? "";

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
      profileImg: draftData.profileImg,
      bio: trimmedBio.length ? trimmedBio : null,
      experienceLevel: Math.min(
        Math.max(Math.floor(draftData.experienceLevel), 0),
        9
      ),
    });
  };

  const handleCancel = () => {
    setDraftData(profileData);
    setEditMode(false);
    updateUserMutation.reset();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex flex-col items-center space-y-3 mb-4">
            <div className="relative inline-flex h-28 w-28 items-center justify-center">
              <ProfileAvatar
                userId={userId}
                draftImage={editMode ? draftData.profileImg : null}
                fallbackInitial={
                  profileData.displayName || user?.displayName || ""
                }
                onUserLoaded={handleUserLoaded}
              />
              {showExperienceLoading ? (
                <div
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-muted/40 animate-pulse ring-2 ring-background"
                  aria-hidden="true"
                />
              ) : (
                <ExperienceBadge
                  level={activeExperienceLevel}
                  className="absolute -bottom-1 -right-1"
                />
              )}
            </div>
            {showExperienceLoading ? (
              <div className="text-center" aria-live="polite" aria-busy="true">
                <div className="mx-auto h-4 w-40 rounded-full bg-muted/50 animate-pulse" />
                <div className="mx-auto mt-2 h-3 w-28 rounded-full bg-muted/40 animate-pulse" />
                <p className="mt-2 text-[11px] text-muted-foreground italic">
                  Fetching your level... stay in the opening sequence.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  Level {experienceInfo.level + 1}: {experienceInfo.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {experienceInfo.subtitle}
                </p>
              </div>
            )}
          </div>
          <CardTitle className="flex items-center justify-between">
            Profile
            {!editMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraftData(profileData);
                  setEditMode(true);
                  updateUserMutation.reset();
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleCancel}
                  disabled={updateUserMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateUserMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editMode ? (
            <>
              <div>
                <Label>Display Name</Label>
                <p className="text-sm text-muted-foreground">
                  {profileData.displayName}
                </p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">
                  {profileData.email}
                </p>
              </div>
              <div>
                <Label>Joined Since</Label>
                <p className="text-sm text-muted-foreground">
                  {formatJoinedSince(profileData.createdAt)}
                </p>
              </div>
              <div>
                <Label>Bio</Label>
                {profileData.bio ? (
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {profileData.bio}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No bio yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  required
                  value={draftData.displayName}
                  onChange={(e) =>
                    setDraftData({ ...draftData, displayName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={draftData.email}
                  onChange={(e) =>
                    setDraftData({ ...draftData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Joined Since</Label>
                <p className="text-sm text-muted-foreground">
                  {formatJoinedSince(profileData.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  System generated.
                </p>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  maxLength={128}
                  value={draftData.bio ?? ""}
                  onChange={(e) =>
                    setDraftData({
                      ...draftData,
                      bio: e.target.value.slice(0, 128),
                    })
                  }
                  placeholder="A short line about your anime taste."
                />
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Keep it short and punchy.</span>
                  <span>{(draftData.bio ?? "").length}/128</span>
                </div>
              </div>
              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-foreground">
                      Level {draftExperienceInfo.level + 1}:{" "}
                      {draftExperienceInfo.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {draftExperienceInfo.subtitle}
                    </span>
                  </div>
                  <input
                    id="experienceLevel"
                    type="range"
                    min={0}
                    max={9}
                    step={1}
                    value={draftData.experienceLevel}
                    onChange={(e) =>
                      setDraftData({
                        ...draftData,
                        experienceLevel: Number(e.target.value),
                      })
                    }
                    className="mt-3 w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  We will auto-calc this from watch history later.
                </p>
              </div>
              <div>
                <Label htmlFor="profileImg">Profile Image</Label>
                <Input
                  id="profileImg"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">Max size: 256KB</p>
              </div>
            </>
          )}
          {updateUserMutation.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {updateUserMutation.error instanceof Error
                ? updateUserMutation.error.message
                : "Something went wrong while saving your profile."}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
