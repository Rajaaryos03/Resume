import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import CVForm from "@/components/admin/CVForm";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage CV" };

export default async function AdminCVPage() {
  const supabase = await createAdminClient();
  const { data: cvList } = await supabase
    .from("cv")
    .select("*")
    .order("uploaded_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Manage CV
        </h1>
        <p className="text-slate-400 text-sm mt-1">Upload a new CV for visitors to download</p>
      </div>

      <CVForm />

      {cvList && cvList.length > 0 && (
        <div className="mt-8 admin-card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Upload History</h2>
          </div>
          <div className="divide-y divide-white/5">
            {cvList.map((cv) => (
              <div key={cv.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{cv.display_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cv.version && `v${cv.version} · `}
                    Uploaded {formatDate(cv.uploaded_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {cv.is_active && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                  <a
                    href={cv.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#56CCF2] hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
