"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { uploadCV } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function CVForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".pdf")) {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a PDF file.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await uploadCV(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("CV uploaded successfully!");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card p-5 sm:p-6 space-y-5">
      {/* File drop zone */}
      <div>
        <label htmlFor="cvFile" className="block text-sm font-semibold text-white mb-2">
          CV File (PDF only, max 5MB) <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            file
              ? "border-[#2F80ED] bg-[#2F80ED]/10"
              : "border-white/20 hover:border-[#2F80ED] hover:bg-white/5"
          }`}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Click to select PDF file"
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={32} className="text-[#2F80ED]" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload size={28} aria-hidden="true" />
              <p className="text-sm font-medium">Click to upload PDF</p>
              <p className="text-xs">Max 5MB · PDF only</p>
            </div>
          )}
          <input
            ref={fileRef}
            id="cvFile"
            name="cvFile"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="sr-only"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold text-white mb-1.5">
            Display Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
            placeholder="Raja Aryos — CV 2025"
            defaultValue="Raja Aryos — CV 2025"
          />
        </div>
        <div>
          <label htmlFor="version" className="block text-sm font-semibold text-white mb-1.5">Version</label>
          <input
            id="version"
            name="version"
            type="text"
            className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
            placeholder="2025.07"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !file}
        className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
      >
        {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
        {isPending ? "Uploading…" : "Upload CV"}
      </button>
    </form>
  );
}
