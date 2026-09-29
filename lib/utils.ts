import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import readingTime from "reading-time";
import { prisma } from "./prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(content: string): string {
  if (!content) return "1 min read";
  const cleanText = content.replace(/<[^>]*>?/gm, "");
  const stats = readingTime(cleanText);
  return stats.text || `${Math.ceil(stats.minutes)} min read`;
}

export function slugifyText(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function generateUniqueSlug(title: string, currentPostId?: string): Promise<string> {
  const baseSlug = slugifyText(title) || "untitled-post";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (currentPostId && existing.id === currentPostId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let clean = html;

  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<\/?(iframe|object|embed|applet|form|input|button|meta|base|link)\b[^>]*>/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");
  clean = clean.replace(/(href|src)\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, "");

  return clean;
}
