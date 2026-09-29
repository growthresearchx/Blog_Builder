"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className:
          "bg-card text-foreground border border-border shadow-xl rounded-xl text-xs font-medium backdrop-blur-md",
      }}
    />
  );
}
