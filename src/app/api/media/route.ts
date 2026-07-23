import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "blog-images";

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.storage.from(BUCKET).list("blog", {
      limit: 200,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const files = (data ?? [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => {
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`blog/${f.name}`);
        return {
          name: f.name,
          path: `blog/${f.name}`,
          url: urlData.publicUrl,
          size: f.metadata?.size ?? 0,
          mimetype: f.metadata?.mimetype ?? "image/*",
          createdAt: f.created_at,
        };
      });

    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path) return NextResponse.json({ error: "No path provided." }, { status: 400 });

    const supabase = await createAdminClient();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
