import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// This route auto-publishes posts whose scheduled_at has passed.
// Call it periodically via:
//  - Vercel Cron Jobs (vercel.json)
//  - External cron (cron-job.org, GitHub Actions, etc.)
//  - Supabase pg_cron extension
//
// Secure it with CRON_SECRET env variable.

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = await createAdminClient();
    const now = new Date().toISOString();

    // Find all draft posts with a scheduled_at in the past
    const { data: posts, error: fetchErr } = await supabase
      .from("blog")
      .select("id, title, slug, scheduled_at")
      .eq("status", "draft")
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchErr) throw fetchErr;
    if (!posts?.length) {
      return NextResponse.json({ published: 0, message: "No posts to publish." });
    }

    const ids = posts.map((p) => p.id);

    const { error: updateErr } = await supabase
      .from("blog")
      .update({
        status: "published",
        published_at: now,
        scheduled_at: null,
        updated_at: now,
      })
      .in("id", ids);

    if (updateErr) throw updateErr;

    console.log(`[cron] Published ${ids.length} scheduled posts:`, posts.map((p) => p.slug));

    return NextResponse.json({
      published: ids.length,
      posts: posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
    });
  } catch (e) {
    console.error("[cron] publish-scheduled error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
