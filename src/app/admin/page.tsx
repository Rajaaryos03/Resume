import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, Briefcase, Award, User, FileUp, PlusCircle,
  FolderKanban, Eye, TrendingUp, Clock, ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";

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
    totalViewsRes,
    profileRes,
    cvRes,
    topBlogsRes,
    recentBlogsRes,
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
    supabase.from("blog").select("id, title, slug, view_count").eq("status", "published").order("view_count", { ascending: false }).limit(5),
    supabase.from("blog").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const totalViewCount = (totalViewsRes.data ?? []).reduce(
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
    profileUpdatedAt: profileRes.data?.updated_at ?? null,
    activeCvName: cvRes.data?.display_name ?? null,
    topBlogs: (topBlogsRes.data ?? []) as { id: string; title: string; slug: string; view_count: number }[],
    recentBlogs: (recentBlogsRes.data ?? []) as { id: string; title: string; slug: string; status: string; updated_at: string }[],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Total Blogs",      value: stats.totalBlog,                       icon: FileText,     href: "/admin/blog",        color: "text-[#56CCF2]" },
    { label: "Published",        value: stats.publishedBlog,                   icon: TrendingUp,   href: "/admin/blog",        color: "text-green-400" },
    { label: "Drafts",           value: stats.draftBlog,                       icon: Clock,        href: "/admin/blog",        color: "text-yellow-400" },
    { label: "Projects",         value: stats.totalProject,                    icon: FolderKanban, href: "/admin/project",     color: "text-purple-400" },
    { label: "Experiences",      value: stats.totalExp,                        icon: Briefcase,    href: "/admin/experience",  color: "text-blue-400" },
    { label: "Certificates",     value: stats.totalCert,                       icon: Award,        href: "/admin/certificate", color: "text-orange-400" },
    { label: "Total Blog Views", value: stats.totalViewCount.toLocaleString(), icon: Eye,          href: "/admin/blog",        color: "text-[#56CCF2]" },
    { label: "Media Manager",    value: "→",                                   icon: ImageIcon,    href: "/admin/media",       color: "text-pink-400" },
  ];

  const quickActions = [
    { href: "/admin/blog/new",        label: "New Blog Post",   icon: PlusCircle,   primary: true },
    { href: "/admin/project/new",     label: "Add Project",     icon: FolderKanban, primary: true },
    { href: "/admin/experience/new",  label: "Add Experience",  icon: Briefcase,    primary: true },
    { href: "/admin/certificate/new", label: "Add Certificate", icon: Award,        primary: true },
    { href: "/admin/media",           label: "Media Manager",   icon: ImageIcon,    primary: false },
    { href: "/admin/medium",          label: "Import Medium",   icon: FileText,     primary: false },
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

      {/* Stats Grid */}
      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">Content statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[#1E293B] border border-white/10 rounded-[10px] p-4 hover:bg-[#273548] hover:border-white/20 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                <card.icon size={17} className={card.color} aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading" className="mb-8">
        <h2 id="actions-heading" className="text-base font-semibold text-white mb-4">Quick Actions</h2>
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

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Blog Posts */}
        <section className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={15} className="text-[#2F80ED]" />
              Top Blog Posts by Views
            </h2>
            <Link href="/admin/blog" className="text-xs text-[#56CCF2] hover:underline">View all</Link>
          </div>
          {stats.topBlogs.length === 0 ? (
            <p className="text-slate-500 text-xs">No published posts yet.</p>
          ) : (
            <ol className="space-y-3">
              {stats.topBlogs.map((b, i) => (
                <li key={b.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-4 shrink-0">{i + 1}</span>
                  <Link
                    href={`/admin/blog/${b.id}/edit`}
                    className="flex-1 text-sm text-slate-300 hover:text-white truncate transition-colors"
                  >
                    {b.title}
                  </Link>
                  <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
                    <Eye size={11} /> {(b.view_count ?? 0).toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Recent Activity */}
        <section className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={15} className="text-[#2F80ED]" />
              Recent Activity
            </h2>
            <Link href="/admin/blog" className="text-xs text-[#56CCF2] hover:underline">View all</Link>
          </div>
          {stats.recentBlogs.length === 0 ? (
            <p className="text-slate-500 text-xs">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentBlogs.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${
                    b.status === "published"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}>
                    {b.status}
                  </span>
                  <Link
                    href={`/admin/blog/${b.id}/edit`}
                    className="flex-1 text-sm text-slate-300 hover:text-white truncate transition-colors"
                  >
                    {b.title}
                  </Link>
                  <span className="text-xs text-slate-500 shrink-0">
                    {b.updated_at ? formatDistanceToNow(new Date(b.updated_at), { addSuffix: true }) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Profile info */}
        <section className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5">
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
        </section>

        {/* Active CV */}
        <section className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5">
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
        </section>

        {/* GitHub */}
        <section className="bg-[#1E293B] border border-white/10 rounded-[10px] p-5 lg:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-[#2F80ED]" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            <span className="text-sm font-semibold text-white">GitHub Activity</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Live contribution graph is shown on your public portfolio under the &quot;GitHub Activity&quot; section.
            Make sure your GitHub username is set in <code className="font-mono text-[#56CCF2]">NEXT_PUBLIC_GITHUB_USERNAME</code> env variable.
          </p>
          <div className="flex gap-3">
            <Link href="/#github" target="_blank" className="text-xs font-semibold text-[#56CCF2] hover:underline">
              View on site →
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/admin/profile" className="text-xs font-semibold text-[#56CCF2] hover:underline">
              Update GitHub URL →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
