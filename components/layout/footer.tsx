import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/20 py-8 md:py-10 text-sm text-muted-foreground">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-foreground group">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <span>BlogBuilder</span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/search" className="hover:text-primary transition-colors">
            Search
          </Link>
          <Link href="/login" className="hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-primary transition-colors">
            Join as Author
          </Link>
        </div>

        <div className="text-xs text-muted-foreground text-center sm:text-right flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>© {currentYear} Analyticsliv Blog Builder</span>
        </div>
      </div>
    </footer>
  );
}
