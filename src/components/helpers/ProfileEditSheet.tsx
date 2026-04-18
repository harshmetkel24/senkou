import { AvatarUpload } from "@/components/helpers/AvatarUpload";
import { ExperienceSlider } from "@/components/helpers/ExperienceSlider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

export type ProfileDraft = {
  displayName: string;
  email: string;
  profileImg: string | null;
  experienceLevel: number;
  bio: string | null;
};

type ProfileEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ProfileDraft;
  onSave: (data: ProfileDraft) => void;
  isSaving: boolean;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function EditForm({
  draft,
  initialData,
  setDraft,
  onSave,
  onDiscard,
  isSaving,
}: {
  draft: ProfileDraft;
  initialData: ProfileDraft;
  setDraft: (d: ProfileDraft) => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}) {
  const bioLength = (draft.bio ?? "").length;
  const hasChanges =
    draft.displayName.trim() !== initialData.displayName.trim() ||
    draft.email.trim() !== initialData.email.trim() ||
    (draft.profileImg ?? null) !== (initialData.profileImg ?? null) ||
    draft.experienceLevel !== initialData.experienceLevel ||
    (draft.bio ?? "").trim() !== (initialData.bio ?? "").trim();

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
      <div className="py-2">
        <AvatarUpload
          currentImage={draft.profileImg}
          fallbackInitial={draft.displayName}
          onChange={(img) => setDraft({ ...draft, profileImg: img })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-displayName">Display Name</Label>
        <Input
          id="edit-displayName"
          required
          value={draft.displayName}
          onChange={(e) =>
            setDraft({ ...draft, displayName: e.target.value })
          }
          disabled={isSaving}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          required
          value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          disabled={isSaving}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-bio">Bio</Label>
        <Textarea
          id="edit-bio"
          maxLength={128}
          value={draft.bio ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, bio: e.target.value.slice(0, 128) })
          }
          placeholder="A short line about your anime taste..."
          disabled={isSaving}
        />
        <div className="flex items-center justify-end">
          <span
            className={`text-xs ${
              bioLength >= 120
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {bioLength}/128
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Experience Level</Label>
        <ExperienceSlider
          value={draft.experienceLevel}
          onChange={(v) => setDraft({ ...draft, experienceLevel: v })}
        />
      </div>

      <div className="flex gap-2 pt-4 mt-auto">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={onDiscard}
          disabled={isSaving}
          type="button"
        >
          Discard Changes
        </Button>
        <Button
          className="flex-1"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          aria-busy={isSaving}
          type="button"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function ProfileEditSheet({
  open,
  onOpenChange,
  initialData,
  onSave,
  isSaving,
}: ProfileEditSheetProps) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState<ProfileDraft>(initialData);

  useEffect(() => {
    if (open) {
      setDraft(initialData);
    }
  }, [open, initialData]);

  const handleSave = () => onSave(draft);
  const handleDiscard = () => onOpenChange(false);

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          aria-label="Edit profile"
        >
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <EditForm
            draft={draft}
            initialData={initialData}
            setDraft={setDraft}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-[420px] overflow-y-auto"
        aria-label="Edit profile"
      >
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <EditForm
            draft={draft}
            initialData={initialData}
            setDraft={setDraft}
            onSave={handleSave}
            onDiscard={handleDiscard}
            isSaving={isSaving}
          />
        </div>
        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}
