import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { getBlogBySlug, getFeaturedBlogs } from "@/lib/db";
import { formatDate, calcReadingTime } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import BlogCard from "@/components/blog/BlogCard";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Post Not Found" };
  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.publishedAt,
      images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [blog, related] = await Promise.all([
    getBlogBySlug(slug),
    getFeaturedBlogs(3),
  ]);

  if (!blog) notFound();

  const readingTime = calcReadingTime(blog.content);
  const relatedPosts = related.filter((b) => b.id !== blog.id).slice(0, 2);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#2F80ED] transition-colors mb-8 group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
          Back to Blog
        </Link>

        <article>
          {/* Category + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="default">{blog.category}</Badge>
            {blog.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-[#94A3B8]">
                <Tag size={10} aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#1E293B] leading-tight mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {blog.title}
          </h1>

          {/* Meta */}
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
            <span className="text-xs font-semibold text-[#2F80ED] uppercase tracking-wide">
              Raja Aryos
            </span>
          </div>

          {/* Cover image */}
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

          {/* Content */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Related posts */}
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
