"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 animate-fade-in-up">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">
        Application Error
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
        Something went wrong!
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
        {error.message || "An unexpected error occurred while processing your request."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2 shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

