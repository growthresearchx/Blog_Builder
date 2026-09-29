"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlogSearch({ placeholder = "Search articles by title, topic, or keyword..." }: { placeholder?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/search");
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    router.push("/search");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3 rounded-full border bg-background shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition"
            title="Clear search"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1.5 rounded-full px-4 h-8 text-xs font-semibold"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
