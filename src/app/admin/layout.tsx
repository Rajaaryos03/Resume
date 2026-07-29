import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-area flex min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 overflow-y-auto min-h-screen">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
