import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProject } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Projects" };

export default async function AdminProjectPage() {
  const supabase = await createAdminClient();
  const { data: projects } = await supabase
    .from("project")
    .select("id, title, category, featured, status, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Manage Projects
          </h1>
          <p className="text-slate-400 text-sm mt-1">{projects?.length ?? 0} projects</p>
        </div>
        <Link
          href="/admin/project/new"
          className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
        >
          <PlusCircle size={15} aria-hidden="true" />
          Add Project
        </Link>
      </div>

      {!projects?.length ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">🚀</p>
          <p className="font-semibold text-white">No projects yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first project to showcase your work.</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-table" aria-label="Project list">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Featured</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-slate-500">Sort: {p.sort_order}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {p.featured ? (
                        <Badge variant="default">Featured</Badge>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={p.status === "published" ? "success" : "outline"}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/project/${p.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#56CCF2] hover:bg-white/10 transition-colors"
                          aria-label={`Edit: ${p.title}`}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <DeleteButton id={p.id} label={p.title} deleteAction={deleteProject} />
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
