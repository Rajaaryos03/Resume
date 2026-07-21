"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { upsertSeries } from "@/lib/actions";
import { slugify } from "@/lib/utils";

interface SeriesFormProps {
  series?: { id: string; title: string; slug: string; description?: string; coverImageUrl?: string };
}

export default function SeriesForm({ series }: SeriesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(series?.title ?? "");
  const [slug, setSlug] = useState(series?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!series?.slug);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertSeries(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(series ? "Series updated!" : "Series created!");
        router.push("/admin/series");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/series" className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {series ? "Edit Series" : "New Series"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {series && <input type="hidden" name="id" value={series.id} />}

        <div className="admin-card p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-white mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title" name="title" type="text" required
              value={title} onChange={(e) => handleTitleChange(e.target.value)}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="Power Platform Fundamentals"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-white mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug" name="slug" type="text" required
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none transition"
              placeholder="power-platform-fundamentals"
            />
            <p className="text-xs text-slate-500 mt-1">Used in URLs — lowercase, hyphens only</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-1.5">
              Description
            </label>
            <textarea
              id="description" name="description" rows={3}
              defaultValue={series?.description ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition"
              placeholder="A series about…"
            />
          </div>

          <div>
            <label htmlFor="coverImageUrl" className="block text-sm font-semibold text-white mb-1.5">
              Cover Image URL
            </label>
            <input
              id="coverImageUrl" name="coverImageUrl" type="url"
              defaultValue={series?.coverImageUrl ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit" disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none min-h-[44px]"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Saving…" : series ? "Update Series" : "Create Series"}
          </button>
          <Link href="/admin/series" className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors min-h-[44px]">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
