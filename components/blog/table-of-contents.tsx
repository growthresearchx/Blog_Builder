"use client";

import { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Parse headings from the rendered article in DOM
    const article = document.querySelector("article");
    if (!article) return;

    const headingElements = article.querySelectorAll("h1, h2, h3");
    const items: HeadingItem[] = [];

    headingElements.forEach((el, index) => {
      // Ensure heading has an id for anchor jumping
      if (!el.id) {
        const generatedId =
          el.textContent
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-") || `heading-${index}`;
        el.id = generatedId;
      }

      items.push({
        id: el.id,
        text: el.textContent || "",
        level: parseInt(el.tagName.replace("H", ""), 10),
      });
    });

    setHeadings(items);

    // Scroll spy via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav className="p-4 border rounded-2xl bg-card shadow-sm space-y-3 sticky top-24">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          <span>Table of Contents</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {headings.length} {headings.length === 1 ? "section" : "sections"}
        </span>
      </div>

      <ul className="space-y-1 text-xs max-h-[65vh] overflow-y-auto pr-1">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li
              key={heading.id}
              style={{ paddingLeft: `${Math.max(0, (heading.level - 2) * 12)}px` }}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className={`group flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors ${
                  isActive
                    ? "font-bold text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <ChevronRight
                  className={`h-3 w-3 shrink-0 transition-transform ${
                    isActive ? "text-primary translate-x-0.5" : "text-muted-foreground/40"
                  }`}
                />
                <span className="truncate">{heading.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
