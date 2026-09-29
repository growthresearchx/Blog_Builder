"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag as TagIcon, X } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-utils";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

interface BlogFilterProps {
  categories?: CategoryOption[];
  tags?: TagOption[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
}

export function BlogFilter({
  categories = [],
  tags = [],
  activeCategorySlug,
  activeTagSlug,
}: BlogFilterProps) {
  const pathname = usePathname();
  const isAllActive = pathname === "/" && !activeCategorySlug && !activeTagSlug;
  const hasActiveFilter = Boolean(activeCategorySlug || activeTagSlug);

  return (
    <div className="space-y-3.5 py-1 w-full">
      {/* Category Filter Pills with Smooth Scrollbar & Edge Awareness */}
      {categories.length > 0 && (
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/"
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isAllActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              All Articles
            </Link>

            {categories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug;
              const theme = getCategoryTheme(cat.name);
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {theme.icon}
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            {hasActiveFilter && (
              <Link
                href="/"
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 flex items-center gap-1 transition-colors"
                title="Clear active filter"
              >
                <X className="h-3 w-3" />
                <span>Clear</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Popular Tags Pills */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <TagIcon className="h-3 w-3" />
            Tags:
          </span>
          {tags.map((t) => {
            const isActive = activeTagSlug === t.slug;
            return (
              <Link
                key={t.id}
                href={`/tag/${t.slug}`}
                className={`px-2.5 py-0.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                #{t.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
