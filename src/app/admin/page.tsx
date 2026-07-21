import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Briefcase, Award, User, FileUp, PlusCircle, FolderKanban, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardStats() {
  const supabase = await createClient();
  const [
    { count: totalBlog },
    { count: publishedBlog },
    { count: draftBlog },
    { count: totalExp },
    { count: totalCert },
    { count: totalProject },
    totalViews,
    profile,
    cv,
  ] = await Promise.all([
    supabase.from("blog").select("*", { count: "exact", head: true }),
    supabase.from("blog").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("blog").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("experience").select("*", { count: "exact", head: true }),
    supabase.from("certificate").select("*", { count: "exact", head: true }),
    supabase.from("project").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("blog").select("view_count").eq("status", "published"),
    supabase.from("profile").select("updated_at").order("updated_at", { ascending: false }).limit(1).single(),
    supabase.from("cv").select("display_name, uploaded_at").eq("is_active", true).order("uploaded_at", { ascending: false }).limit(1).single(),
  ]);

  const totalViewCount = (totalViews.data ?? []).reduce(
    (sum: number, row: { view_count: number }) => sum + (row.view_count ?? 0),
    0
  );

  return {
    totalBlog: totalBlog ?? 0,
    publishedBlog: publishedBlog ?? 0,
    draftBlog: draftBlog ?? 0,
    totalExp: totalExp ?? 0,
    totalCert: totalCert ?? 0,
    totalProject: totalProject ?? 0,
    totalViewCount,
    profileUpdatedAt: profile.data?.updated_at ?? null,
    activeCvName: cv.data?.display_name ?? null,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Blogs",    value: stats.totalBlog,       icon: FileText,      href: "/admin/blog" },
    { label: "Published",      value: stats.publishedBlog,   icon: FileText,      href: "/admin/blog" },
    { label: "Drafts",         value: stats.draftBlog,       icon: FileText,      href: "/admin/blog" },
    { label: "Projects",       value: stats.totalProject,    icon: FolderKanban,  href: "/admin/project" },
    { label: "Experiences",    value: stats.totalExp,        icon: Briefcase,     href: "/admin/experience" },
    { label: "Certificates",   value: stats.totalCert,       icon: Award,         href: "/admin/certificate" },
    { label: "Total Blog Views", value: stats.totalViewCount.toLocaleString(), icon: Eye, href: "/admin/blog" },
  ];

  const quickActions = [
    { href: "/admin/blog/new",        label: "New Blog Post",   icon: PlusCircle,   primary: true },
    { href: "/admin/project/new",     label: "Add Project",     icon: FolderKanban, primary: true },
    { href: "/admin/experience/new",  label: "Add Experience",  icon: Briefcase,    primary: true },
    { href: "/admin/certificate/new", label: "Add Certificate", icon: Award,        primary: true },
    { href: "/admin/profile",         label: "Update Profile",  icon: User,         primary: false },
    { href: "/admin/cv",              label: "Upload CV",       icon: FileUp,       primary: false },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your portfolio content</p>
      </div>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">Content statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[#1E293B] border border-white/10 rounded-[10px] p-4 hover:bg-[#273548] hover:border-white/20 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2F80ED]/20 flex items-center justify-center mb-3">
                <card.icon size={17} className="text-[#56CCF2]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading" className="mb-8">
        <h2 id="actions-heading" className="text-base font-semibold text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px] ${
                action.primary
                  ? "bg-[#2F80ED] hover:bg-[#2563EB] text-white"
                  : "bg-[#1E293B] hover:bg-[#273548] text-white border border-white/10"
              }`}
            >
              <action.icon size={15} aria-hidden="true" />
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Info cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <User size={16} className="text-[#2F80ED]" aria-hidden="true" />
            <span className="text-sm font-semibold text-white">Profile</span>
          </div>
          <p className="text-xs text-slate-400">
            {stats.profileUpdatedAt
              ? `Last updated: ${new Date(stats.profileUpdatedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}`
              : "No profile data yet"}
          </p>
          <Link href="/admin/profile" className="mt-3 inline-block text-xs font-semibold text-[#56CCF2] hover:underline">
            Edit Profile →
          </Link>
        </div>
        <div className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileUp size={16} className="text-[#2F80ED]" aria-hidden="true" />
            <span className="text-sm font-semibold text-white">Active CV</span>
          </div>
          <p className="text-xs text-slate-400">
            {stats.activeCvName ?? "No CV uploaded yet"}
          </p>
          <Link href="/admin/cv" className="mt-3 inline-block text-xs font-semibold text-[#56CCF2] hover:underline">
            Manage CV →
          </Link>
        </div>
      </section>
    </div>
  );
}
