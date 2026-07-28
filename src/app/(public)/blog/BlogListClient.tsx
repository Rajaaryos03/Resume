"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import type { Blog, BlogCategory } from "@/types";

const CATEGORIES: (BlogCategory | "All")[] = [
  "All",
  "Power Platform",
  "Power Apps",
  "Power Automate",
  "Dataverse",
  "Copilot Studio",
  "SharePoint",
  "Productivity",
  "AI Agent",
  "Tutorial",
];

interface BlogListClientProps {
  initialBlogs: Blog[];
  initialTotal: number;
  initialCategory: string;
  initialSearch: string;
}

export default function BlogListClient({
  initialBlogs,
  initialTotal,
  initialCategory,
  initialSearch,
}: BlogListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [total, setTotal] = useState(initialTotal);
  const [category, setCategory] = useState<BlogCategory | "All">(
    (initialCategory as BlogCategory | "All") || "All"
  );
  const [search, setSearch] = useState(initialSearch || "");
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const LIMIT = 9;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchBlogs = useCallback(
    async (cat: string, q: string, pg: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cat && cat !== "All") params.set("category", cat);
        if (q) params.set("search", q);
        params.set("page", String(pg));
        params.set("limit", String(LIMIT));

        const res = await fetch(`/api/blogs?${params.toString()}`);
        const data = await res.json();
        setBlogs(data.blogs);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (page === 1 && category === (initialCategory || "All") && search === (initialSearch || "")) {
      setBlogs(initialBlogs);
      setTotal(initialTotal);
      return;
    }
    fetchBlogs(category, search, page);
  }, [category, search, page, fetchBlogs, initialBlogs, initialTotal, initialCategory, initialSearch]);

  const handleCategoryChange = (cat: BlogCategory | "All") => {
    setCategory(cat);
    setPage(1);
    const p = new URLSearchParams(searchParams.toString());
    cat === "All" ? p.delete("category") : p.set("category", cat);
    p.delete("page");
    router.push(`/blog?${p.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    const p = new URLSearchParams(searchParams.toString());
    searchInput ? p.set("search", searchInput) : p.delete("search");
    p.delete("page");
    router.push(`/blog?${p.toString()}`);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    const p = new URLSearchParams(searchParams.toString());
    p.delete("search");
    router.push(`/blog?${p.toString()}`);
  };

  return (
    <>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6" role="search">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent transition"
            aria-label="Search blog articles"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Category filter */}
      <div
        className="flex flex-wrap gap-2 mb-8"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat as BlogCategory | "All")}
            aria-pressed={category === cat}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] ${
              category === cat
                ? "bg-[#2F80ED] text-white shadow-sm"
                : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results summary */}
      {search && (
        <p className="text-sm text-[#64748B] mb-5">
          {total} result{total !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[10px] border border-[#E2E8F0] h-72 animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-live="polite">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[#64748B]" aria-live="polite">
          <p className="text-4xl mb-4" aria-hidden="true">📝</p>
          <p className="text-lg font-semibold mb-1">No blog posts found</p>
          <p className="text-sm">
            {search
              ? "Try a different search term or category."
              : "New articles will be available soon."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex justify-center items-center gap-2 mt-10"
          aria-label="Blog pagination"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:pointer-events-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[40px]"
            aria-label="Previous page"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={page === p ? "page" : undefined}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] ${
                page === p
                  ? "bg-[#2F80ED] text-white"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:pointer-events-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[40px]"
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}
