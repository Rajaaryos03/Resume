import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Tag } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, calcReadingTime } from "@/lib/utils";
import type { Blog } from "@/types";

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export default function BlogCard({ blog, featured }: BlogCardProps) {
  return (
    <article
      className={`bg-white/5 border border-white/10 rounded-[10px] hover:bg-white/8 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex ${
        featured ? "flex-col sm:flex-row" : "flex-col"
      } h-full`}
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
            <span key={tag} className="flex items-center gap-1 text-xs text-slate-400">
              <Tag size={10} aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>

        <Link href={`/blog/${blog.slug}`} className="group flex-1">
          <h3
            className={`font-bold text-white group-hover:text-[#56CCF2] transition-colors leading-snug mb-2 ${
              featured ? "text-xl" : "text-base"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {blog.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
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
        </div>
      </div>
    </article>
  );
}
