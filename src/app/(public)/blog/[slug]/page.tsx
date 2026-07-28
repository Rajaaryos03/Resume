import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Tag, Eye } from "lucide-react";
import { getBlogBySlug, getRelatedBlogs, getSeriesByBlogId, getProfile } from "@/lib/db";
import { formatDate, calcReadingTime } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import BlogCard from "@/components/blog/BlogCard";
import ViewCounter from "@/components/blog/ViewCounter";
import sanitizeHtml from "sanitize-html";
import BlogReactions from "@/components/blog/BlogReactions";
import BlogComments from "@/components/blog/BlogComments";
import ShareButtons from "@/components/blog/ShareButtons";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import BlogSeriesNav from "@/components/blog/BlogSeriesNav";
import TableOfContents from "@/components/blog/TableOfContents";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const SITE_URL = "https://rajaaryos.dev";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Post Not Found" };

  const url = `${SITE_URL}/blog/${slug}`;
  const ogImage = blog.coverImageUrl
    ? [{ url: blog.coverImageUrl, width: 1200, height: 630, alt: blog.title }]
    : undefined;

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: [blog.category, ...blog.tags],
    authors: [{ name: "Raja Aryos", url: SITE_URL }],
    alternates: { canonical: url },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      url,
      siteName: "Raja Aryos",
      publishedTime: blog.publishedAt ?? undefined,
      modifiedTime: blog.updatedAt,
      authors: ["Raja Aryos"],
      tags: blog.tags,
      ...(ogImage && { images: ogImage }),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      ...(blog.coverImageUrl && { images: [blog.coverImageUrl] }),
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [blog, profile] = await Promise.all([
    getBlogBySlug(slug),
    getProfile(),
  ]);

  if (!blog) notFound();

  const [related, series] = await Promise.all([
    getRelatedBlogs(slug, blog.category, 3),
    getSeriesByBlogId(blog.id),
  ]);

  const readingTime = calcReadingTime(blog.content);
  const relatedPosts = related.slice(0, 2);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#F8FAFC]">
      <ArticleJsonLd
        title={blog.title}
        excerpt={blog.excerpt}
        slug={blog.slug}
        publishedAt={blog.publishedAt}
        updatedAt={blog.updatedAt}
        coverImageUrl={blog.coverImageUrl}
        tags={blog.tags}
        category={blog.category}
        authorName={profile?.fullName ?? "Raja Aryos"}
        authorUrl={SITE_URL}
        siteUrl={SITE_URL}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: blog.title, path: `/blog/${blog.slug}` },
        ]}
        siteUrl={SITE_URL}
      />

      <ReadingProgressBar />
      <ViewCounter slug={blog.slug} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#2F80ED] transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to Blog
        </Link>

        <div className="flex gap-10 items-start">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="default">{blog.category}</Badge>
              {blog.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag size={10} aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold text-[#1E293B] leading-tight mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] mb-8 pb-8 border-b border-[#E2E8F0]">
              {blog.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} aria-hidden="true" />
                  {formatDate(blog.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={14} aria-hidden="true" />
                {readingTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} aria-hidden="true" />
                {blog.viewCount.toLocaleString()} views
              </span>
              <span className="text-xs font-semibold text-[#2F80ED] uppercase tracking-wide">
                {profile?.fullName ?? "Raja Aryos"}
              </span>
            </div>

            {blog.coverImageUrl && (
              <div className="relative h-64 sm:h-80 rounded-[10px] overflow-hidden mb-8">
                <Image
                  src={blog.coverImageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, 896px"
                />
              </div>
            )}

            {series && <BlogSeriesNav series={series} currentSlug={blog.slug} />}

            <div
              id="blog-content"
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(blog.content, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4", "iframe"]),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    img: ["src", "alt", "width", "height", "class", "style"],
                    "*": ["class", "style", "id"],
                  },
                }),
              }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-t border-[#E2E8F0] mt-8">
              <BlogReactions slug={blog.slug} />
              <ShareButtons title={blog.title} slug={blog.slug} />
            </div>
          </article>

          {/* Table of Contents sticky sidebar */}
          <aside className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-28">
              <TableOfContents content={blog.content} />
            </div>
          </aside>
        </div>

        <BlogComments slug={blog.slug} />

        {relatedPosts.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-xl font-bold text-[#1E293B] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {relatedPosts.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
