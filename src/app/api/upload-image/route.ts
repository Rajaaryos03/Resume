import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "blog-images";
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = await createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    if (
      uploadError.message.includes("Bucket not found") ||
      uploadError.message.includes("bucket")
    ) {
      return NextResponse.json(
        {
          error:
            "Storage bucket 'blog-images' not found. Create it in Supabase Dashboard → Storage → New bucket → name: blog-images → Public: ON",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl });
}
