import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 animate-fade-in" aria-live="polite">
      <Spinner size="lg" className="text-primary" />
      <p className="text-xs font-medium text-muted-foreground animate-pulse">Loading content...</p>
    </div>
  );
}

