export type BlogAuthor = { name: string; email: string | null; username: string };
export type BlogItem = {
  id: string; title: string; body: string | null; slug: string; author: BlogAuthor;
  views: string; likes: string | null; banner: string; created_at: string; created_at_human: string;
};
export type BlogDetail = BlogItem;

type BlogsResponse = {
  data: BlogItem[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
};
const API_BASE = "https://api.propertyinnepal.com.np/api/V1";

// Fetch the legacy blog feed until the article migration is completed.
export async function fetchBlogs(page: number): Promise<BlogsResponse> {
  try {
    const response = await fetch(`${API_BASE}/blogs?page=${page}`, { cache: "no-store" });
    if (!response.ok) return { data: [], meta: undefined };
    return await response.json() as BlogsResponse;
  } catch {
    return { data: [], meta: undefined };
  }
}

// Fetch a legacy blog record by its public slug.
export async function fetchBlogBySlug(slug: string): Promise<BlogDetail | null> {
  const response = await fetch(`${API_BASE}/blog/${slug}`, { cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json() as { data?: BlogDetail; message?: string };
  return payload.message === "Blog Not Found" ? null : payload.data ?? null;
}
