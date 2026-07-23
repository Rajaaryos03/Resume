import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import sharp from "sharp";

const BUCKET = "blog-images";
const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 85;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_INPUT_SIZE) {
    return NextResponse.json({ error: "Image must be under 10MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const meta = await sharp(buffer).metadata();
    const isGif = meta.format === "gif";
    const isSvg = meta.format === "svg";

    let optimizedBuffer: Buffer;
    let outputMimeType: string;
    let outputExt: string;

    if (isGif || isSvg) {
      optimizedBuffer = buffer;
      outputMimeType = file.type;
      outputExt = isGif ? "gif" : "svg";
    } else {
      const needsResize =
        (meta.width ?? 0) > MAX_WIDTH || (meta.height ?? 0) > MAX_HEIGHT;

      try {
        optimizedBuffer = await sharp(buffer)
          .resize(needsResize ? MAX_WIDTH : undefined, needsResize ? MAX_HEIGHT : undefined, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY, effort: 4 })
          .toBuffer();
        outputMimeType = "image/webp";
        outputExt = "webp";
      } catch {
        optimizedBuffer = await sharp(buffer)
          .resize(needsResize ? MAX_WIDTH : undefined, needsResize ? MAX_HEIGHT : undefined, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: JPEG_QUALITY, progressive: true })
          .toBuffer();
        outputMimeType = "image/jpeg";
        outputExt = "jpg";
      }

      // If optimization made it bigger for tiny images, keep original
      if (optimizedBuffer.length > buffer.length && buffer.length < 100 * 1024) {
        optimizedBuffer = buffer;
        outputMimeType = file.type;
        outputExt = file.name.split(".").pop() ?? "jpg";
      }
    }

    const savedPercent =
      buffer.length > 0
        ? Math.round((1 - optimizedBuffer.length / buffer.length) * 100)
        : 0;

    const fileName = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${outputExt}`;
    const supabase = await createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, optimizedBuffer, { contentType: outputMimeType, upsert: false });

    if (uploadError) {
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
        return NextResponse.json(
          { error: "Storage bucket 'blog-images' not found. Create it in Supabase Dashboard → Storage → New bucket → name: blog-images → Public: ON" },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({
      url: data.publicUrl,
      originalSize: buffer.length,
      optimizedSize: optimizedBuffer.length,
      savedPercent: Math.max(0, savedPercent),
      format: outputExt,
    });
  } catch (e) {
    // Fallback: upload original without optimization
    console.error("[upload-image] optimization failed, uploading original:", e);
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const supabase = await createAdminClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return NextResponse.json({ url: data.publicUrl, savedPercent: 0, format: ext });
  }
}
