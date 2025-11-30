import type { ComponentProps } from "react";

import { Toaster as SonnerToaster, toast } from "sonner";

type ToasterProps = ComponentProps<typeof SonnerToaster>;

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "bg-card/95 text-foreground border border-border shadow-lg shadow-yellow-900/20",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { toast };
