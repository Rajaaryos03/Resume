import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import BlogForm from "@/components/admin/BlogForm";
import type { Blog } from "@/types";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const [{ data }, { data: series }] = await Promise.all([
    supabase.from("blog").select("*").eq("id", id).single(),
    supabase.from("blog_series").select("id, title").order("title"),
  ]);

  if (!data) notFound();

  const blog: Blog = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    tags: data.tags ?? [],
    coverImageUrl: data.cover_image_url,
    status: data.status,
    publishedAt: data.published_at,
    viewCount: data.view_count ?? 0,
    seriesId: data.series_id ?? undefined,
    seriesOrder: data.series_order ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return <BlogForm blog={blog} seriesList={series ?? []} />;
}
