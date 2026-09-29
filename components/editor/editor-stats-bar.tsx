"use client";

import { Clock, Type, AlignLeft, FileSpreadsheet } from "lucide-react";

interface EditorStatsBarProps {
  content: string;
}

export function EditorStatsBar({ content }: EditorStatsBarProps) {
  // Strip HTML tags to get raw plain text
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const charCount = plainText.length;
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  
  // Count paragraphs based on <p> or newlines
  const paragraphMatches = content.match(/<p[^>]*>.*?<\/p>/gi);
  const paragraphCount = paragraphMatches
    ? paragraphMatches.filter((p) => p.replace(/<[^>]*>/g, "").trim().length > 0).length
    : (plainText ? 1 : 0);

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 border-t bg-muted/30 text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5" title="Word count">
          <Type className="h-3.5 w-3.5 text-primary" />
          <span><strong className="text-foreground">{wordCount}</strong> words</span>
        </span>

        <span className="flex items-center gap-1.5" title="Character count">
          <AlignLeft className="h-3.5 w-3.5 text-primary" />
          <span><strong className="text-foreground">{charCount}</strong> chars</span>
        </span>

        <span className="flex items-center gap-1.5" title="Paragraph count">
          <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
          <span><strong className="text-foreground">{paragraphCount}</strong> {paragraphCount === 1 ? "paragraph" : "paragraphs"}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span>~{readingTimeMinutes} min read</span>
      </div>
    </div>
  );
}
