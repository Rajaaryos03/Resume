"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { upsertBlog } from "@/lib/actions";
import { slugify } from "@/lib/utils";
import type { Blog, BlogCategory, BlogSeries } from "@/types";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-white/15 rounded-lg bg-[#0B1F3A] min-h-[400px] flex items-center justify-center">
      <Loader2 size={20} className="animate-spin text-slate-400" />
    </div>
  ),
});

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
  seriesList?: Pick<BlogSeries, "id" | "title">[];
}

export default function BlogForm({ blog, seriesList = [] }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!blog?.slug);
  const [content, setContent] = useState(blog?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(blog?.coverImageUrl ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }
      setCoverImageUrl(data.url);
      toast.success("Cover image uploaded!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("content", content);
    formData.set("coverImageUrl", coverImageUrl);

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
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none transition"
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
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition"
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

          {/* Series */}
          {seriesList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="seriesId" className="block text-sm font-semibold text-white mb-1.5">
                  Series
                </label>
                <select
                  id="seriesId"
                  name="seriesId"
                  defaultValue={blog?.seriesId ?? ""}
                  className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition bg-white"
                >
                  <option value="">— No series —</option>
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="seriesOrder" className="block text-sm font-semibold text-white mb-1.5">
                  Part #
                </label>
                <input
                  id="seriesOrder"
                  name="seriesOrder"
                  type="number"
                  min={1}
                  defaultValue={blog?.seriesOrder ?? ""}
                  className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
                  placeholder="1"
                />
              </div>
            </div>
          )}

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Cover Image
            </label>
            {coverImageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/15">
                <Image
                  src={coverImageUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="600px"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                  title="Remove cover image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/20 hover:border-[#2F80ED]/60 rounded-lg py-8 text-slate-400 hover:text-[#2F80ED] transition-colors"
              >
                {uploadingCover ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ImageIcon size={18} />
                )}
                <span className="text-sm">{uploadingCover ? "Uploading…" : "Click to upload cover image"}</span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="admin-card p-5 sm:p-6">
          <label className="block text-sm font-semibold text-white mb-3">
            Content <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <RichTextEditor
            name="content"
            value={content}
            onChange={setContent}
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
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[44px]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
