"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { upsertProfile } from "@/lib/actions";
import type { Profile } from "@/types";

export default function ProfileForm({ profile }: { profile?: Profile }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertProfile(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {profile && <input type="hidden" name="id" value={profile.id} />}

      <div className="admin-card p-5 sm:p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3">Basic Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-white mb-1.5">Full Name <span className="text-red-500" aria-hidden="true">*</span></label>
            <input id="fullName" name="fullName" type="text" required defaultValue={profile?.fullName ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Iranto Tua Raja Aryos" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-1.5">Email <span className="text-red-500" aria-hidden="true">*</span></label>
            <input id="email" name="email" type="email" required defaultValue={profile?.email ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="email@example.com" />
          </div>
        </div>

        <div>
          <label htmlFor="professionalTitle" className="block text-sm font-semibold text-white mb-1.5">Professional Title <span className="text-red-500" aria-hidden="true">*</span></label>
          <input id="professionalTitle" name="professionalTitle" type="text" required defaultValue={profile?.professionalTitle ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Power Platform Developer | Business Process Automation" />
        </div>

        <div>
          <label htmlFor="shortBio" className="block text-sm font-semibold text-white mb-1.5">Short Bio <span className="text-red-500" aria-hidden="true">*</span></label>
          <textarea id="shortBio" name="shortBio" required rows={2} defaultValue={profile?.shortBio ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition" placeholder="One or two sentences about you…" />
        </div>

        <div>
          <label htmlFor="longDescription" className="block text-sm font-semibold text-white mb-1.5">Long Description <span className="text-red-500" aria-hidden="true">*</span></label>
          <textarea id="longDescription" name="longDescription" required rows={6} defaultValue={profile?.longDescription ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-y focus:outline-none transition font-mono" placeholder="<p>Full professional description. HTML supported.</p>" />
          <p className="text-xs text-slate-500 mt-1">HTML supported (paragraphs, bold, lists)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-white mb-1.5">Location</label>
            <input id="location" name="location" type="text" defaultValue={profile?.location ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Jakarta, Indonesia" />
          </div>
          <div>
            <label htmlFor="profileImageUrl" className="block text-sm font-semibold text-white mb-1.5">Profile Image URL</label>
            <input id="profileImageUrl" name="profileImageUrl" type="url" defaultValue={profile?.profileImageUrl ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="https://…" />
          </div>
        </div>

        <div>
          <label htmlFor="availabilityStatus" className="block text-sm font-semibold text-white mb-1.5">
            Availability Badge
          </label>
          <input
            id="availabilityStatus"
            name="availabilityStatus"
            type="text"
            defaultValue={profile?.availabilityStatus ?? ""}
            className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
            placeholder="Available for opportunities"
            maxLength={60}
          />
          <p className="text-xs text-slate-500 mt-1">Shown as badge di hero. Kosongkan untuk disembunyikan.</p>
        </div>
      </div>

      <div className="admin-card p-5 sm:p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3">Social Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="linkedInUrl" className="block text-sm font-semibold text-white mb-1.5">LinkedIn URL</label>
            <input id="linkedInUrl" name="linkedInUrl" type="url" defaultValue={profile?.linkedInUrl ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="https://linkedin.com/in/…" />
          </div>
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-semibold text-white mb-1.5">GitHub URL</label>
            <input id="githubUrl" name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="https://github.com/…" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="microsoftLearnUrl" className="block text-sm font-semibold text-white mb-1.5">Microsoft Learn Profile URL</label>
            <input id="microsoftLearnUrl" name="microsoftLearnUrl" type="url" defaultValue={profile?.microsoftLearnUrl ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="https://learn.microsoft.com/users/…" />
          </div>
        </div>
      </div>

      <div className="admin-card p-5 sm:p-6">
        <label htmlFor="skills" className="block text-sm font-semibold text-white mb-1.5">Skills / Technologies</label>
        <input id="skills" name="skills" type="text" defaultValue={profile?.skills.join(", ") ?? ""} className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition" placeholder="Power Apps, Power Automate, Dataverse, SharePoint" />
        <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
      </div>

      <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]">
        {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
        {isPending ? "Saving…" : "Update Profile"}
      </button>
    </form>
  );
}
