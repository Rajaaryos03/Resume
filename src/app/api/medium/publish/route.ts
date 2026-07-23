import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { blogId } = await req.json();
    if (!blogId) {
      return NextResponse.json({ error: "blogId required." }, { status: 400 });
    }

    const token = process.env.MEDIUM_INTEGRATION_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "MEDIUM_INTEGRATION_TOKEN is not set in environment variables." },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Fetch blog
    const { data: blog, error: blogErr } = await supabase
      .from("blog")
      .select("*")
      .eq("id", blogId)
      .single();

    if (blogErr || !blog) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }

    // Get Medium user ID
    const meRes = await fetch("https://api.medium.com/v1/me", {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!meRes.ok) {
      const meErr = await meRes.json().catch(() => ({}));
      throw new Error(
        `Medium auth failed (${meRes.status}): ${meErr?.errors?.[0]?.message ?? "Invalid token"}`
      );
    }
    const { data: me } = await meRes.json();

    // Build canonical URL for cross-post attribution
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const canonicalUrl = siteUrl ? `${siteUrl}/blog/${blog.slug}` : undefined;

    // Compose tags — Medium allows max 5
    const tags: string[] = [
      blog.category,
      ...(blog.tags ?? []),
    ]
      .filter(Boolean)
      .slice(0, 5);

    const body: Record<string, unknown> = {
      title: blog.title,
      contentFormat: "html",
      content: blog.content,
      tags,
      publishStatus: "public",
    };

    if (canonicalUrl) body.canonicalUrl = canonicalUrl;

    // Publish to Medium
    const pubRes = await fetch(
      `https://api.medium.com/v1/users/${me.id}/posts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!pubRes.ok) {
      const pubErr = await pubRes.json().catch(() => ({}));
      throw new Error(
        `Medium publish failed (${pubRes.status}): ${pubErr?.errors?.[0]?.message ?? "Unknown error"}`
      );
    }

    const { data: post } = await pubRes.json();

    // Save Medium URL back to the blog record
    await supabase
      .from("blog")
      .update({ medium_url: post.url, updated_at: new Date().toISOString() })
      .eq("id", blogId);

    return NextResponse.json({
      success: true,
      mediumUrl: post.url,
      mediumId: post.id,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
