import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Input } from "./input";

type PasswordFieldProps = {
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordField({
  label,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((current) => !current);

  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
      {label}
      <div className="relative">
        <Input
          {...inputProps}
          type={isVisible ? "text" : "password"}
          className={cn("pr-12", className)}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="icon"
          onClick={toggleVisibility}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
        >
          {isVisible ? (
            <EyeOff aria-hidden className="size-4" />
          ) : (
            <Eye aria-hidden className="size-4" />
          )}
        </Button>
      </div>
    </label>
  );
}
