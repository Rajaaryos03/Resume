import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Pencil, Eye } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteBlog } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Blog" };

type FilterStatus = "all" | "published" | "draft";

export default async function AdminBlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (status ?? "all") as FilterStatus;

  const supabase = await createAdminClient();

  let query = supabase
    .from("blog")
    .select("id, title, category, status, published_at, created_at, view_count")
    .order("created_at", { ascending: false })
    .limit(10);

  if (filter === "published") query = query.eq("status", "published");
  if (filter === "draft") query = query.eq("status", "draft");

  const { data: blogs } = await query;

  const tabs: { label: string; value: FilterStatus }[] = [
    { label: "Latest 10", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Manage Blog
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Showing {blogs?.length ?? 0} post{blogs?.length !== 1 ? "s" : ""}
            {filter !== "all" ? ` · ${filter}` : " · latest 10"}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
        >
          <PlusCircle size={15} aria-hidden="true" />
          Create New Blog
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/blog" : `/admin/blog?status=${tab.value}`}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-[#2F80ED] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!blogs?.length ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">📝</p>
          <p className="font-semibold text-white">No blog posts found</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter !== "all" ? "Try a different filter." : "Create your first post to get started."}
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-table" aria-label="Blog posts">
              <thead>
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                    <span className="inline-flex items-center gap-1"><Eye size={11} aria-hidden="true" />Views</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium truncate max-w-[200px]">{blog.title}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <Badge variant="default">{blog.category}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={blog.status === "published" ? "success" : "warning"}>
                        {blog.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                        <Eye size={12} className="text-slate-500" aria-hidden="true" />
                        {(blog.view_count ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden md:table-cell">
                      {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/blog/${blog.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#56CCF2] hover:bg-white/10 transition-colors"
                          aria-label={`Edit: ${blog.title}`}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Link>
                        <DeleteButton id={blog.id} label={blog.title} deleteAction={deleteBlog} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
