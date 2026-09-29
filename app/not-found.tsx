import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 animate-fade-in-up">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="h-8 w-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md text-sm sm:text-base leading-relaxed">
        The article or page you are looking for does not exist, was unpublished, or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button className="gap-2 shadow-sm">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search Articles
          </Button>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t w-full max-w-sm">
        <p className="text-xs text-muted-foreground mb-2">Explore popular topics:</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {["Next.js", "React", "TypeScript", "Performance", "Security"].map((topic) => (
            <Link
              key={topic}
              href={`/search?q=${encodeURIComponent(topic)}`}
              className="text-xs bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full border transition-colors"
            >
              #{topic}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

