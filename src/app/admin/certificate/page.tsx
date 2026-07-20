import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { formatMonthYear } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteCertificate } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Certificates" };

export default async function AdminCertificatePage() {
  const supabase = await createClient();
  const { data: certs } = await supabase
    .from("certificate")
    .select("id, certificate_name, issuer, issue_date, category, status")
    .order("issue_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Manage Certificates
          </h1>
          <p className="text-slate-400 text-sm mt-1">{certs?.length ?? 0} certificates</p>
        </div>
        <Link
          href="/admin/certificate/new"
          className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
        >
          <PlusCircle size={15} aria-hidden="true" />
          Add Certificate
        </Link>
      </div>

      {!certs?.length ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">🏅</p>
          <p className="font-semibold text-white">No certificates yet</p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-table" aria-label="Certificate list">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Certificate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Issued</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((cert) => (
                  <tr key={cert.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium truncate max-w-xs">{cert.certificate_name}</p>
                      <p className="text-xs text-slate-400">{cert.issuer}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {cert.category && <Badge variant="default">{cert.category}</Badge>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 hidden md:table-cell">
                      {formatMonthYear(cert.issue_date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={cert.status === "published" ? "success" : "outline"}>{cert.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/certificate/${cert.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#56CCF2] hover:bg-white/10 transition-colors"
                          aria-label={`Edit: ${cert.certificate_name}`}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <DeleteButton id={cert.id} label={cert.certificate_name} deleteAction={deleteCertificate} />
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
