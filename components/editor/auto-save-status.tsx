"use client";

import { CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";

export function AutoSaveStatus({
  status,
  lastSaved,
}: {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
}) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Saving draft...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Auto-save failed</span>
      </div>
    );
  }

  if (status === "saved" && lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        <span>Saved at {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="w-3.5 h-3.5" />
      <span>Auto-save enabled</span>
    </div>
  );
}
