"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ImageIcon, X, Eye, Edit3, Send, CheckCircle, ExternalLink } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!blog?.slug);
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? "");
  const [content, setContent] = useState(blog?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(blog?.coverImageUrl ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    blog?.scheduledAt
      ? "scheduled"
      : blog?.status === "published"
      ? "published"
      : "draft"
  );
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    if (!blog?.scheduledAt) return "";
    // Convert stored UTC ISO to local datetime-local format (YYYY-MM-DDTHH:MM)
    const d = new Date(blog.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [publishingMedium, setPublishingMedium] = useState(false);
  const [mediumUrl, setMediumUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handlePublishToMedium = async () => {
    if (!blog?.id) {
      toast.error("Save the post first before publishing to Medium.");
      return;
    }
    setPublishingMedium(true);
    try {
      const res = await fetch("/api/medium/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId: blog.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      setMediumUrl(data.mediumUrl);
      toast.success("Published to Medium!");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setPublishingMedium(false);
    }
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
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
      const saved = data.savedPercent ?? 0;
      toast.success(
        saved > 0
          ? `Cover uploaded & optimized \u2014 ${saved}% smaller (${data.format?.toUpperCase() ?? "WebP"})`
          : "Cover image uploaded!"
      );
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
    // Always inject status + scheduledAt explicitly from state
    // (scheduledAt input is conditionally rendered so may not be in FormData)
    formData.set("status", status);
    if (status === "scheduled") {
      // datetime-local value is in local (WIB/browser) time — convert to UTC ISO for DB
      const localDate = new Date(scheduledAt);
      formData.set("scheduledAt", localDate.toISOString());
    } else {
      formData.delete("scheduledAt");
    }

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

        {/* Write / Preview toggle */}
        <div className="ml-auto flex items-center bg-white/10 rounded-lg p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "write"
                ? "bg-[#2F80ED] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Edit3 size={13} aria-hidden="true" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-[#2F80ED] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye size={13} aria-hidden="true" />
            Preview
          </button>
        </div>
      </div>

      {/* ── PREVIEW TAB ── */}
      {activeTab === "preview" && (
        <div className="admin-card p-6 sm:p-10">
          <div className="max-w-3xl mx-auto">
            {coverImageUrl && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden mb-8">
                <Image src={coverImageUrl} alt="Cover" fill className="object-cover" sizes="800px" />
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#2F80ED]/20 text-[#56CCF2] border border-[#2F80ED]/30">
                Preview
              </span>
              {slug && (
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-white/10 text-slate-400 font-mono">
                  /blog/{slug}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              {title || <span className="text-slate-500 italic">Untitled post…</span>}
            </h1>
            {excerpt && (
              <p className="text-lg text-slate-300 leading-relaxed mb-8 pb-8 border-b border-white/10">
                {excerpt}
              </p>
            )}
            {content ? (
              <div
                className="prose prose-invert prose-sm sm:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-slate-500 italic text-center py-16">No content yet — start writing to see the preview.</p>
            )}
          </div>
        </div>
      )}

      {/* ── WRITE TAB ── */}
      <form onSubmit={handleSubmit} className={`space-y-6 ${activeTab === "preview" ? "hidden" : ""}`}>
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
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
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
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "scheduled")}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Scheduled publish datetime */}
          {status === "scheduled" && (
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-semibold text-white mb-1.5">
                Publish At <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                Post will auto-publish at this date &amp; time (WIB/UTC+7). Cron job runs daily at 08:00 WIB.
              </p>
            </div>
          )}

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
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
          >
            {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isPending ? "Saving…" : blog ? "Update Post" : "Create Post"}
          </button>

          {/* Publish to Medium */}
          {blog && (
            mediumUrl ? (
              <a
                href={mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors min-h-[44px]"
              >
                <CheckCircle size={15} aria-hidden="true" />
                Published on Medium
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handlePublishToMedium}
                disabled={publishingMedium}
                title={"Requires MEDIUM_INTEGRATION_TOKEN in .env.local"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/25 transition-colors disabled:opacity-60 disabled:pointer-events-none min-h-[44px]"
              >
                {publishingMedium
                  ? <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  : <Send size={15} aria-hidden="true" />}
                {publishingMedium ? "Publishing…" : "Publish to Medium"}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "write" ? "preview" : "write")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[44px]"
          >
            <Eye size={15} aria-hidden="true" />
            {activeTab === "write" ? "Preview" : "Back to Write"}
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
