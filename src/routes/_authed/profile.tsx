import {
  ProfileAvatar,
  getUserInfoQueryKey,
} from "@/components/helpers/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
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
  }));
  const [draftData, setDraftData] = useState(profileData);
  const fullUserQueryKey = getUserInfoQueryKey(userId);

  const handleUserLoaded = (fullUser: UserInfo) => {
    if (editMode) return;
    const nextProfile = {
      displayName: fullUser.displayName || "",
      email: fullUser.email || "",
      profileImg: fullUser.profileImg || null,
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

  const handleSave = () => {
    if (!userId || updateUserMutation.isPending) return;

    const trimmedDisplayName = draftData.displayName.trim();
    const trimmedEmail = draftData.email.trim();

    if (!trimmedDisplayName || !trimmedEmail) {
      toast.error("Missing details", {
        description: "Display name and email cannot be empty.",
      });
      return;
    }

    updateUserMutation.mutate({
      id: userId,
      displayName: trimmedDisplayName,
      email: trimmedEmail,
      profileImg: draftData.profileImg,
    });
  };

  const handleCancel = () => {
    setDraftData(profileData);
    setEditMode(false);
    updateUserMutation.reset();
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4 mb-4">
            <ProfileAvatar
              userId={userId}
              draftImage={editMode ? draftData.profileImg : null}
              fallbackInitial={
                profileData.displayName || user?.displayName || ""
              }
              onUserLoaded={handleUserLoaded}
            />
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
