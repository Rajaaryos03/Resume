import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Tag, Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, calcReadingTime } from "@/lib/utils";
import type { Blog } from "@/types";

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
  /** "dark" = used on dark backgrounds (home section); "light" = used on light backgrounds (blog page) */
  variant?: "dark" | "light";
}

export default function BlogCard({ blog, featured, variant = "dark" }: BlogCardProps) {
  const isLight = variant === "light";

  return (
    <article
      className={`border rounded-[10px] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex ${
        featured ? "flex-col sm:flex-row" : "flex-col"
      } h-full ${
        isLight
          ? "bg-white border-[#E2E8F0] hover:border-[#2F80ED]/40 hover:shadow-md"
          : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
      }`}
    >
      {/* Cover image */}
      <Link
        href={`/blog/${blog.slug}`}
        className={`block flex-shrink-0 bg-gradient-to-br from-[#0B1F3A] to-[#102A43] ${
          featured ? "w-full sm:w-64 h-48 sm:h-auto" : "h-44"
        } relative overflow-hidden group`}
        aria-label={`Read: ${blog.title}`}
        tabIndex={-1}
      >
        {blog.coverImageUrl ? (
          <Image
            src={blog.coverImageUrl}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-[#2F80ED]/40" aria-hidden="true">
              {blog.category.slice(0, 2)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="default">{blog.category}</Badge>
          {blog.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={`flex items-center gap-1 text-xs ${isLight ? "text-slate-400" : "text-slate-400"}`}>
              <Tag size={10} aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>

        <Link href={`/blog/${blog.slug}`} className="group flex-1">
          <h3
            className={`font-bold transition-colors leading-snug mb-2 group-hover:text-[#56CCF2] ${
              featured ? "text-xl" : "text-base"
            } ${isLight ? "text-[#1E293B]" : "text-white"}`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {blog.title}
          </h3>
        </Link>

        <p className={`text-sm leading-relaxed mb-4 line-clamp-3 ${isLight ? "text-[#64748B]" : "text-slate-400"}`}>
          {blog.excerpt}
        </p>

        <div className={`flex items-center gap-4 text-xs mt-auto ${isLight ? "text-[#94A3B8]" : "text-slate-500"}`}>
          {blog.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} aria-hidden="true" />
              {formatDate(blog.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            {calcReadingTime(blog.content)} min read
          </span>
          {blog.viewCount > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <Eye size={11} aria-hidden="true" />
              {blog.viewCount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
