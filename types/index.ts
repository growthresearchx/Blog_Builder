export type Role = "ADMIN" | "EMPLOYEE";
export type PostStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status: PostStatus;
  readingTime?: string | null;
  viewCount: number;
  authorId?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count?: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface AdminStats {
  totalBlogs: number;
  totalViews: number;
  mostActiveEmployee: {
    name: string;
    email: string;
    blogCount: number;
  } | null;
}
