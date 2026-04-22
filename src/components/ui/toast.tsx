"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "glass-card border-app-border text-app-text-primary rounded-2xl shadow-xl",
          description: "text-app-text-secondary",
        },
      }}
    />
  );
}
