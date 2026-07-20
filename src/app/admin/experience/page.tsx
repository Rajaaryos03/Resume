import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { formatMonthYear } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteExperience } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Experience" };

export default async function AdminExperiencePage() {
  const supabase = await createAdminClient();
  const { data: experiences } = await supabase
    .from("experience")
    .select("id, role_title, company, start_date, end_date, is_current_role, status")
    .order("start_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Manage Experience
          </h1>
          <p className="text-slate-400 text-sm mt-1">{experiences?.length ?? 0} entries</p>
        </div>
        <Link
          href="/admin/experience/new"
          className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
        >
          <PlusCircle size={15} aria-hidden="true" />
          Add Experience
        </Link>
      </div>

      {!experiences?.length ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">💼</p>
          <p className="font-semibold text-white">No experience entries yet</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-table" aria-label="Experience list">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Period</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp) => (
                  <tr key={exp.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{exp.role_title}</p>
                      <p className="text-xs text-slate-400">{exp.company}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden sm:table-cell">
                      {formatMonthYear(exp.start_date)} — {exp.is_current_role ? "Present" : exp.end_date ? formatMonthYear(exp.end_date) : "Present"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={exp.status === "published" ? "success" : "outline"}>{exp.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/experience/${exp.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#56CCF2] hover:bg-white/10 transition-colors"
                          aria-label={`Edit: ${exp.role_title}`}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <DeleteButton id={exp.id} label={exp.role_title} deleteAction={deleteExperience} />
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
