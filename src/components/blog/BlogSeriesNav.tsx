import Link from "next/link";
import { BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import type { BlogSeriesWithPosts } from "@/types";

interface BlogSeriesNavProps {
  series: BlogSeriesWithPosts;
  currentSlug: string;
}

export default function BlogSeriesNav({ series, currentSlug }: BlogSeriesNavProps) {
  const currentIndex = series.posts.findIndex((p) => p.slug === currentSlug);

  return (
    <div className="my-8 border border-[#2F80ED]/30 bg-[#EFF6FF] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-[#2F80ED]/10 border-b border-[#2F80ED]/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2F80ED] flex items-center justify-center shrink-0">
          <BookOpen size={15} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#2F80ED] uppercase tracking-wide">Series</p>
          <p className="text-sm font-bold text-[#1E293B]" style={{ fontFamily: "var(--font-heading)" }}>
            {series.title}
          </p>
        </div>
        <span className="ml-auto text-xs text-[#64748B] shrink-0">
          {currentIndex + 1} of {series.posts.length}
        </span>
      </div>

      {/* Post list */}
      <ol className="divide-y divide-[#E2E8F0]">
        {series.posts.map((post, i) => {
          const isCurrent = post.slug === currentSlug;
          const isDone = i < currentIndex;

          return (
            <li key={post.id}>
              {isCurrent ? (
                <div className="flex items-center gap-3 px-5 py-3 bg-[#2F80ED]/5">
                  <span className="w-6 h-6 rounded-full bg-[#2F80ED] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#1E293B] flex-1">{post.title}</span>
                  <ChevronRight size={14} className="text-[#2F80ED] shrink-0" />
                </div>
              ) : (
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#F1F5F9] transition-colors group"
                >
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <span className="w-6 h-6 rounded-full border-2 border-[#CBD5E1] text-[#94A3B8] text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                  )}
                  <span className={`text-sm flex-1 group-hover:text-[#2F80ED] transition-colors ${isDone ? "text-[#64748B]" : "text-[#475569]"}`}>
                    {post.title}
                  </span>
                  <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#2F80ED] shrink-0 transition-colors" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Prev / Next navigation */}
      {series.posts.length > 1 && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          {currentIndex > 0 ? (
            <Link
              href={`/blog/${series.posts[currentIndex - 1].slug}`}
              className="text-xs text-[#64748B] hover:text-[#2F80ED] transition-colors flex items-center gap-1"
            >
              ← Part {currentIndex}
            </Link>
          ) : <div />}
          {currentIndex < series.posts.length - 1 ? (
            <Link
              href={`/blog/${series.posts[currentIndex + 1].slug}`}
              className="text-xs text-[#64748B] hover:text-[#2F80ED] transition-colors flex items-center gap-1 ml-auto"
            >
              Part {currentIndex + 2} →
            </Link>
          ) : (
            <span className="text-xs text-green-600 font-semibold ml-auto">✓ Series complete!</span>
          )}
        </div>
      )}
    </div>
  );
}
