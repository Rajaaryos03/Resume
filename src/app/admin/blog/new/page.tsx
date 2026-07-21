import BlogForm from "@/components/admin/BlogForm";
import { createAdminClient } from "@/lib/supabase/server";

export default async function NewBlogPage() {
  const supabase = await createAdminClient();
  const { data: series } = await supabase
    .from("blog_series")
    .select("id, title")
    .order("title");
  return <BlogForm seriesList={series ?? []} />;
}
