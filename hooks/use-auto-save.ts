"use client";

import { useEffect, useRef, useState } from "react";

export function useAutoSave<T extends Record<string, any>>({
  data,
  onSave,
  interval = 3000,
  enabled = true,
}: {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  enabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const dataRef = useRef(data);
  const initialRef = useRef(true);

  // Update dataRef whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!enabled) return;

    // Skip the first immediate mount render
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      // Don't auto-save if title and content are completely empty
      if (!dataRef.current.title && !dataRef.current.content) return;

      try {
        setStatus("saving");
        await onSave(dataRef.current);
        setStatus("saved");
        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save hook error:", err);
        setStatus("error");
      }
    }, interval);

    return () => clearTimeout(timer);
  }, [data, enabled, interval, onSave]);

  return { status, lastSaved, setStatus };
}
