import type { Metadata } from "next";
import { getProfile } from "@/lib/db";
import ProfileForm from "@/components/admin/ProfileForm";

export const metadata: Metadata = { title: "Manage Profile" };

export default async function AdminProfilePage() {
  const profile = await getProfile();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Manage Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">Update your public profile information</p>
      </div>
      <ProfileForm profile={profile ?? undefined} />
    </div>
  );
}
