import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import SeriesForm from "@/components/admin/SeriesForm";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data } = await supabase.from("blog_series").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <SeriesForm
      series={{
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description ?? undefined,
        coverImageUrl: data.cover_image_url ?? undefined,
      }}
    />
  );
}
