"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { upsertBlog } from "@/lib/actions";
import { slugify } from "@/lib/utils";
import type { Blog, BlogCategory } from "@/types";

const CATEGORIES: BlogCategory[] = [
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

interface BlogFormProps {
  blog?: Blog;
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!blog?.slug);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await upsertBlog(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(blog ? "Blog updated!" : "Blog created!");
        router.push("/admin/blog");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/blog"
          className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Back to blog list"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            {blog ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {blog && <input type="hidden" name="id" value={blog.id} />}

        <div className="admin-card p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3">
            Post Details
          </h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-white mb-1.5">
              Title <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="My Power Platform Tutorial"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-white mb-1.5">
              Slug <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#1E293B] font-mono focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent transition"
              placeholder="my-power-platform-tutorial"
            />
            <p className="text-xs text-slate-500 mt-1">URL: /blog/{slug || "slug"}</p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-semibold text-white mb-1.5">
              Excerpt <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              defaultValue={blog?.excerpt ?? ""}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#1E293B] resize-none focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent transition"
              placeholder="A short summary of this post…"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-1.5">
                Category <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue={blog?.category ?? ""}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-white mb-1.5">
                Status <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue={blog?.status ?? "draft"}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-white mb-1.5">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              defaultValue={blog?.tags.join(", ") ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Cover image URL */}
          <div>
            <label htmlFor="coverImageUrl" className="block text-sm font-semibold text-white mb-1.5">
              Cover Image URL
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              defaultValue={blog?.coverImageUrl ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="https://…"
            />
          </div>
        </div>

        {/* Content */}
        <div className="admin-card p-5 sm:p-6">
          <label htmlFor="content" className="block text-sm font-semibold text-[#1E293B] mb-3">
            Content <span className="text-red-500" aria-hidden="true">*</span>
            <span className="text-xs text-[#94A3B8] font-normal ml-2">(HTML supported)</span>
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={20}
            defaultValue={blog?.content ?? ""}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm text-[#1E293B] font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent transition"
            placeholder="<p>Write your blog content here…</p>"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
          >
            {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isPending ? "Saving…" : blog ? "Update Post" : "Create Post"}
          </button>
          <Link
            href="/admin/blog"
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94A3B8] min-h-[44px]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
