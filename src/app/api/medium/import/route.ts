import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import slugify from "slugify";

// ── XML parser helpers (no external lib needed) ──────────────────────────────
function extractTag(xml: string, tag: string): string {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  return (xml.match(cdataRe)?.[1] ?? xml.match(plainRe)?.[1] ?? "").trim();
}

function extractAllTags(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim());
  }
  return results;
}

function splitItems(xml: string): string[] {
  const re = /<item>([\s\S]*?)<\/item>/gi;
  const items: string[] = [];
  let m;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  return items;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFirstImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

// ── Category mapper ──────────────────────────────────────────────────────────
const CAT_MAP: Record<string, string> = {
  "power platform": "Power Platform",
  "power apps": "Power Apps",
  "power automate": "Power Automate",
  dataverse: "Dataverse",
  "copilot studio": "Copilot Studio",
  sharepoint: "SharePoint",
  productivity: "Productivity",
  "ai agent": "AI Agent",
  tutorial: "Tutorial",
};

function mapCategory(cats: string[]): string {
  for (const c of cats) {
    const mapped = CAT_MAP[c.toLowerCase()];
    if (mapped) return mapped;
  }
  return "Tutorial";
}

// ── IMPORT handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Medium username required." }, { status: 400 });
    }

    const clean = username.replace(/^@/, "").trim();
    const feedUrl = `https://medium.com/feed/@${encodeURIComponent(clean)}`;

    // Fetch directly — set a browser-like User-Agent so Medium doesn't block
    const rssRes = await fetch(feedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; portfolio-importer/1.0; +https://github.com)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 0 },
    });

    if (!rssRes.ok) {
      throw new Error(
        `Medium RSS returned HTTP ${rssRes.status}. ` +
        `Make sure your Medium username is correct and your profile is public.`
      );
    }

    const xml = await rssRes.text();
    if (!xml.includes("<item>")) {
      throw new Error(
        "No posts found in the Medium RSS feed. " +
        "Your profile might be private or have no published posts."
      );
    }

    const rawItems = splitItems(xml).slice(0, 20);
    if (!rawItems.length) {
      return NextResponse.json({ imported: 0, skipped: 0, total: 0 });
    }

    const supabase = await createAdminClient();
    let imported = 0;
    let skipped = 0;

    for (const item of rawItems) {
      const title = extractTag(item, "title") || "Untitled";
      const link = extractTag(item, "link") || extractTag(item, "guid");
      const guid = extractTag(item, "guid") || link;
      const pubDateRaw = extractTag(item, "pubDate");
      const contentEncoded =
        extractTag(item, "content:encoded") ||
        extractTag(item, "description");
      const categories = extractAllTags(item, "category");

      const slug = slugify(title, { lower: true, strict: true }).slice(0, 80);

      // Skip if already imported
      const { data: existing } = await supabase
        .from("blog")
        .select("id")
        .or(`slug.eq.${slug},medium_guid.eq.${guid}`)
        .limit(1)
        .maybeSingle();

      if (existing) { skipped++; continue; }

      const excerptRaw = stripHtml(contentEncoded).slice(0, 300);
      const coverImage = extractFirstImage(contentEncoded);

      const payload = {
        title,
        slug,
        excerpt: excerptRaw || title,
        content: contentEncoded,
        category: mapCategory(categories),
        tags: categories,
        cover_image_url: coverImage,
        status: "draft",
        published_at: pubDateRaw ? new Date(pubDateRaw).toISOString() : null,
        medium_guid: guid || null,
        medium_url: link || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("blog").insert(payload);
      if (error) {
        // slug collision fallback
        const { error: e2 } = await supabase
          .from("blog")
          .insert({ ...payload, slug: `${slug}-${Date.now()}` });
        if (e2) { skipped++; continue; }
      }
      imported++;
    }

    return NextResponse.json({ imported, skipped, total: rawItems.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
