import { getPublishedBlogs } from "@/lib/db";
import { getProfile } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: Request) {
  const baseUrl = new URL(req.url).origin;

  const [profile, { blogs }] = await Promise.all([
    getProfile(),
    getPublishedBlogs({ limit: 20 }),
  ]);

  const siteTitle = profile?.fullName ? `${profile.fullName} — Blog` : "Blog";
  const siteDesc = profile?.shortBio ?? "Articles on Power Platform and Microsoft tech";
  const authorEmail = profile?.email ?? "";
  const authorName = profile?.fullName ?? "Author";

  const items = blogs
    .map((blog) => {
      const pubDate = blog.publishedAt
        ? new Date(blog.publishedAt).toUTCString()
        : new Date(blog.createdAt).toUTCString();
      const link = `${baseUrl}/blog/${escapeXml(blog.slug)}`;
      const tags = blog.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("");

      return `
    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(blog.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(authorEmail)} (${escapeXml(authorName)})</author>
      <category>${escapeXml(blog.category)}</category>
      ${tags}
      ${blog.coverImageUrl ? `<enclosure url="${escapeXml(blog.coverImageUrl)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}/blog</link>
    <description>${escapeXml(siteDesc)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>${escapeXml(siteTitle)}</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
