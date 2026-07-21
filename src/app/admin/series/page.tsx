import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteSeries } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Series" };

export default async function AdminSeriesPage() {
  const supabase = await createAdminClient();
  const { data: series } = await supabase
    .from("blog_series")
    .select("id, title, slug, created_at")
    .order("created_at", { ascending: false });

  // Count posts per series
  const counts: Record<string, number> = {};
  if (series?.length) {
    const { data: posts } = await supabase
      .from("blog")
      .select("series_id")
      .not("series_id", "is", null);
    for (const p of posts ?? []) {
      if (p.series_id) counts[p.series_id] = (counts[p.series_id] ?? 0) + 1;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Blog Series
          </h1>
          <p className="text-slate-400 text-sm mt-1">{series?.length ?? 0} series</p>
        </div>
        <Link
          href="/admin/series/new"
          className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors min-h-[44px]"
        >
          <PlusCircle size={15} />
          New Series
        </Link>
      </div>

      {!series?.length ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold text-white">No series yet</p>
          <p className="text-slate-400 text-sm mt-1">Group your blog posts into a series.</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-table">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Posts</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3.5 font-medium">{s.title}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs font-mono hidden sm:table-cell">{s.slug}</td>
                    <td className="px-4 py-3.5 text-slate-300">{counts[s.id] ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/series/${s.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#56CCF2] hover:bg-white/10 transition-colors"
                        >
                          <Pencil size={15} />
                        </Link>
                        <DeleteButton id={s.id} label={s.title} deleteAction={deleteSeries} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
