"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { upsertCertificate } from "@/lib/actions";
import type { Certificate } from "@/types";

const CATEGORIES = ["Microsoft", "Power Platform", "Cloud", "AI", "Other"];

export default function CertificateForm({ certificate }: { certificate?: Certificate }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertCertificate(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(certificate ? "Certificate updated!" : "Certificate added!");
        router.push("/admin/certificate");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/certificate" className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Back">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {certificate ? "Edit Certificate" : "Add Certificate"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {certificate && <input type="hidden" name="id" value={certificate.id} />}

        <div className="admin-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="certificateName" className="block text-sm font-semibold text-white mb-1.5">Certificate Name <span className="text-red-500" aria-hidden="true">*</span></label>
              <input id="certificateName" name="certificateName" type="text" required defaultValue={certificate?.certificateName ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Microsoft Certified: Power Platform Developer" />
            </div>
            <div>
              <label htmlFor="issuer" className="block text-sm font-semibold text-white mb-1.5">Issuer <span className="text-red-500" aria-hidden="true">*</span></label>
              <input id="issuer" name="issuer" type="text" required defaultValue={certificate?.issuer ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Microsoft" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-semibold text-white mb-1.5">Issue Date <span className="text-red-500" aria-hidden="true">*</span></label>
              <input id="issueDate" name="issueDate" type="date" required defaultValue={certificate?.issueDate ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" />
            </div>
            <div>
              <label htmlFor="expirationDate" className="block text-sm font-semibold text-white mb-1.5">Expiration Date</label>
              <input id="expirationDate" name="expirationDate" type="date" defaultValue={certificate?.expirationDate ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-1.5">Category</label>
              <select id="category" name="category" defaultValue={certificate?.category ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="credentialId" className="block text-sm font-semibold text-white mb-1.5">Credential ID</label>
              <input id="credentialId" name="credentialId" type="text" defaultValue={certificate?.credentialId ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none transition" placeholder="ABC123XYZ" />
            </div>
            <div>
              <label htmlFor="credentialUrl" className="block text-sm font-semibold text-white mb-1.5">Credential URL</label>
              <input id="credentialUrl" name="credentialUrl" type="url" defaultValue={certificate?.credentialUrl ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="https://learn.microsoft.com/…" />
            </div>
          </div>

          <div>
            <label htmlFor="certificateImageUrl" className="block text-sm font-semibold text-white mb-1.5">Badge Image URL</label>
            <input id="certificateImageUrl" name="certificateImageUrl" type="url" defaultValue={certificate?.certificateImageUrl ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="https://images.credly.com/…" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-1.5">Description</label>
            <textarea id="description" name="description" rows={3} defaultValue={certificate?.description ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition" placeholder="Short description of this certification…" />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-white mb-1.5">Status</label>
            <select id="status" name="status" defaultValue={certificate?.status ?? "published"} className="admin-input w-full sm:w-48 px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition">
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]">
            {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isPending ? "Saving…" : certificate ? "Update Certificate" : "Add Certificate"}
          </button>
          <Link href="/admin/certificate" className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors min-h-[44px]">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
