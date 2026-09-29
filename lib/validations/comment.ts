import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  postId: z.string(),
});

export type CommentInput = z.infer<typeof commentSchema>;
