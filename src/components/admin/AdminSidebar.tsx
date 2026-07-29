"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Award,
  User,
  FileUp,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  FolderKanban,
  MessageSquare,
  Database,
  BookOpen,
  ImageIcon,
  Download,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: "Manage Blog", icon: FileText },
  { href: "/admin/series", label: "Blog Series", icon: BookOpen },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/media", label: "Media Manager", icon: ImageIcon },
  { href: "/admin/medium", label: "Import Medium", icon: Download },
  { href: "/admin/project", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/certificate", label: "Certificates", icon: Award },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/cv", label: "CV", icon: FileUp },
  { href: "/admin/migrations", label: "Migrations", icon: Database },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSubPage = pathname !== "/admin";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link
          href="/admin"
          className="text-white font-bold text-lg"
          style={{ fontFamily: "var(--font-heading)" }}
          onClick={() => setMobileOpen(false)}
        >
          Raja<span className="text-[#2F80ED]">.</span>admin
        </Link>
        <p className="text-slate-400 text-xs mt-0.5">Content Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Admin navigation">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56CCF2]",
              isActive(href, exact)
                ? "bg-[#2F80ED] text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
            aria-current={isActive(href, exact) ? "page" : undefined}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
            {isActive(href, exact) && (
              <ChevronRight size={13} className="ml-auto" aria-hidden="true" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors mb-1"
        >
          View Public Site ↗
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut size={17} aria-hidden="true" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0B1F3A] h-screen sticky top-0 shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B1F3A] border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSubPage && (
            <button
              onClick={() => router.back()}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
          )}
          <Link
            href="/admin"
            className="text-white font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Raja<span className="text-[#2F80ED]">.</span>admin
          </Link>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-2 rounded-lg hover:bg-white/10"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0B1F3A] flex flex-col animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
