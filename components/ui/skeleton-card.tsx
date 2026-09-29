import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 space-y-4 shadow-sm animate-pulse",
        className
      )}
    >
      {/* Cover Image Skeleton */}
      <div className="aspect-[16/9] w-full rounded-lg bg-muted/70 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Meta Bar */}
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-20 bg-muted/60 rounded" />
        <div className="h-3.5 w-16 bg-muted/60 rounded" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="h-5 w-4/5 bg-muted/80 rounded" />
        <div className="h-5 w-2/3 bg-muted/80 rounded" />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5 pt-1">
        <div className="h-3.5 w-full bg-muted/50 rounded" />
        <div className="h-3.5 w-5/6 bg-muted/50 rounded" />
      </div>

      {/* Author Footer */}
      <div className="pt-3 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-muted/70" />
          <div className="h-3.5 w-24 bg-muted/60 rounded" />
        </div>
        <div className="h-3.5 w-12 bg-muted/50 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
