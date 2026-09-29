import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(250, "Title is too long"),
  slug: z.string().optional(),
  excerpt: z.string().max(500, "Excerpt must be under 500 characters").optional().nullable(),
  content: z.string().min(1, "Content cannot be empty"),
  coverImage: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED"]).default("DRAFT"),
});

export const autoSaveSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type BlogInput = z.infer<typeof blogSchema>;
export type AutoSaveInput = z.infer<typeof autoSaveSchema>;
