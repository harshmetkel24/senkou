import { ProfileAvatarFallback } from "@/components/helpers/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload, X } from "lucide-react";
import { useRef } from "react";

type AvatarUploadProps = {
  currentImage: string | null;
  fallbackInitial: string;
  onChange: (base64: string | null) => void;
};

export function AvatarUpload({
  currentImage,
  fallbackInitial,
  onChange,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 256 * 1024) {
      toast.error("File too large", {
        description: "Max allowed size is 256KB.",
      });
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    toast("Avatar removed", {
      description: "Click undo to restore.",
      action: {
        label: "Undo",
        onClick: () => onChange(currentImage),
      },
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className="relative group cursor-pointer rounded-full"
        onClick={() => inputRef.current?.click()}
        aria-label="Change Avatar"
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt="Avatar preview"
            className="size-20 rounded-full object-cover shadow-lg ring-2 ring-border group-hover:ring-primary/40 transition-all duration-200"
          />
        ) : (
          <ProfileAvatarFallback initial={fallbackInitial} size={80} />
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Upload className="size-5 text-white" />
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar image"
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          Change Avatar
        </Button>
        {currentImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="size-3.5" />
            Remove Avatar
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Max size: 256KB</p>
    </div>
  );
}
