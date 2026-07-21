import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createAdminClient();

  const { data: blog } = await supabase
    .from("blog")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data } = await supabase
    .from("blog_reaction")
    .select("emoji")
    .eq("blog_id", blog.id);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.emoji] = (counts[row.emoji] ?? 0) + 1;
  }

  return NextResponse.json({ counts });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { emoji, fingerprint } = await req.json();

  if (!emoji || !fingerprint) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  const { data: blog } = await supabase
    .from("blog")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: existing } = await supabase
    .from("blog_reaction")
    .select("id")
    .eq("blog_id", blog.id)
    .eq("emoji", emoji)
    .eq("fingerprint", fingerprint)
    .single();

  if (existing) {
    await supabase.from("blog_reaction").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  await supabase.from("blog_reaction").insert({
    blog_id: blog.id,
    emoji,
    fingerprint,
  });

  return NextResponse.json({ action: "added" });
}
