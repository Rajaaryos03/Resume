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
  const { data } = await supabase.from("blog").select("*").eq("id", id).single();

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
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return <BlogForm blog={blog} />;
}
