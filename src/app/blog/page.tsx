import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedBlogs } from "@/lib/db";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles and insights on Power Platform, Microsoft 365, AI, and productivity.",
  openGraph: {
    title: "Blog — Raja Aryos",
    description: "Articles and insights on Power Platform, Microsoft 365, AI, and productivity.",
    type: "website",
    url: "https://rajaaryos.dev/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Raja Aryos",
    description: "Articles and insights on Power Platform, Microsoft 365, AI, and productivity.",
  },
  alternates: {
    canonical: "https://rajaaryos.dev/blog",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const category = params.category || "All";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);

  const { blogs, total } = await getPublishedBlogs({
    category,
    search,
    page,
    limit: 9,
  });

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Blog
          </h1>
          <p className="text-[#64748B]">
            Articles and insights on Power Platform, Microsoft 365, and productivity.
          </p>
          <div className="mt-3 h-1 w-12 rounded-full bg-[#2F80ED]" aria-hidden="true" />
        </div>

        <Suspense fallback={<div className="text-[#64748B]">Loading…</div>}>
          <BlogListClient
            initialBlogs={blogs}
            initialTotal={total}
            initialCategory={category}
            initialSearch={search}
          />
        </Suspense>
      </div>
    </div>
  );
}
