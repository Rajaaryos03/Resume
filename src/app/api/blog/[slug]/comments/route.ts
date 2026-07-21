import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const RATE_LIMIT_MS = 60 * 1000;
const rateLimitMap = new Map<string, number>();

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

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

  if (!blog) return NextResponse.json({ comments: [] });

  const { data } = await supabase
    .from("blog_comment")
    .select("id, author_name, content, created_at, is_owner_reply, parent_id")
    .eq("blog_id", blog.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  const comments = (data ?? []).map((c) => ({
    ...c,
    is_owner_reply: c.is_owner_reply ?? false,
    parent_id: c.parent_id ?? null,
  }));

  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const ip = getIP(req);
  const key = `${ip}:${slug}`;
  const now = Date.now();
  const last = rateLimitMap.get(key) ?? 0;

  if (now - last < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Please wait a minute before commenting again." },
      { status: 429 }
    );
  }

  const { author_name, content } = await req.json();

  if (!author_name?.trim() || !content?.trim())
    return NextResponse.json({ error: "Name and comment are required." }, { status: 400 });
  if (author_name.trim().length > 80)
    return NextResponse.json({ error: "Name too long." }, { status: 400 });
  if (content.trim().length > 1000)
    return NextResponse.json({ error: "Comment too long (max 1000 chars)." }, { status: 400 });

  const supabase = await createAdminClient();
  const { data: blog } = await supabase
    .from("blog")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase.from("blog_comment").insert({
    blog_id: blog.id,
    author_name: author_name.trim(),
    content: content.trim(),
    is_approved: false,
  });

  if (error) return NextResponse.json({ error: "Failed to save comment." }, { status: 500 });

  rateLimitMap.set(key, now);
  return NextResponse.json({ success: true });
}
