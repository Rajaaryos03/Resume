"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { upsertExperience } from "@/lib/actions";
import type { Experience } from "@/types";

interface ExperienceFormProps {
  experience?: Experience;
}

export default function ExperienceForm({ experience }: ExperienceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCurrentRole, setIsCurrentRole] = useState(experience?.isCurrentRole ?? false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertExperience(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(experience ? "Experience updated!" : "Experience added!");
        router.push("/admin/experience");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/experience" className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors" aria-label="Back">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {experience ? "Edit Experience" : "Add Experience"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {experience && <input type="hidden" name="id" value={experience.id} />}

        <div className="admin-card p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roleTitle" className="block text-sm font-semibold text-white mb-1.5">
                Role Title <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="roleTitle" name="roleTitle" type="text" required defaultValue={experience?.roleTitle ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Power Platform Developer" />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-semibold text-white mb-1.5">
                Company <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="company" name="company" type="text" required defaultValue={experience?.company ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="NTT DATA Business Solutions" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employmentType" className="block text-sm font-semibold text-white mb-1.5">Employment Type</label>
              <select id="employmentType" name="employmentType" defaultValue={experience?.employmentType ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition">
                <option value="">Not specified</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-white mb-1.5">Location</label>
              <input id="location" name="location" type="text" defaultValue={experience?.location ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Jakarta, Indonesia" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-white mb-1.5">
                Start Date <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="startDate" name="startDate" type="date" required defaultValue={experience?.startDate ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-white mb-1.5">End Date</label>
              <input id="endDate" name="endDate" type="date" disabled={isCurrentRole} defaultValue={experience?.endDate ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition disabled:opacity-40 disabled:bg-[#F8FAFC]" />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input id="isCurrentRole" name="isCurrentRole" type="checkbox" checked={isCurrentRole} onChange={(e) => setIsCurrentRole(e.target.checked)} className="w-4 h-4 rounded border-[#E2E8F0] text-[#2F80ED] focus:ring-[#2F80ED]" />
              <label htmlFor="isCurrentRole" className="text-sm font-medium text-[#1E293B] cursor-pointer">Current Role</label>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-1.5">
              Description <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea id="description" name="description" required rows={4} defaultValue={experience?.description ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition" placeholder="Describe your responsibilities and contributions…" />
          </div>

          <div>
            <label htmlFor="achievements" className="block text-sm font-semibold text-white mb-1.5">Key Achievements</label>
            <textarea id="achievements" name="achievements" rows={4} defaultValue={experience?.achievements.join("\n") ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition" placeholder="One achievement per line…" />
            <p className="text-xs text-slate-500 mt-1">One achievement per line</p>
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-semibold text-white mb-1.5">Technologies Used</label>
            <input id="technologies" name="technologies" type="text" defaultValue={experience?.technologies.join(", ") ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Power Apps, Power Automate, Dataverse" />
            <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-white mb-1.5">Status</label>
              <select id="status" name="status" defaultValue={experience?.status ?? "published"} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition">
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-semibold text-white mb-1.5">Sort Order</label>
              <input id="sortOrder" name="sortOrder" type="number" min="0" defaultValue={experience?.sortOrder ?? 0} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]">
            {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isPending ? "Saving…" : experience ? "Update Experience" : "Add Experience"}
          </button>
          <Link href="/admin/experience" className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] transition-colors min-h-[44px]">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
