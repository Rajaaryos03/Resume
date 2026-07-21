import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://rajaaryos.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: blogs } = await supabase
    .from("blog")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const blogEntries: MetadataRoute.Sitemap = (blogs ?? []).map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...blogEntries,
  ];
}
