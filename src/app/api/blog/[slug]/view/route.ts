import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ error: "No slug" }, { status: 400 });

  const supabase = await createAdminClient();

  const { error } = await supabase.rpc("increment_blog_views", { blog_slug: slug });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
