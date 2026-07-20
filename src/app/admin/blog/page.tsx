import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteBlog } from "@/lib/actions";

export const metadata: Metadata = { title: "Manage Blog" };

export default async function AdminBlogListPage() {
  const supabase = await createAdminClient();
  const { data: blogs } = await supabase
    .from("blog")
    .select("id, title, category, status, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Manage Blog
          </h1>
          <p className="text-slate-400 text-sm mt-1">{blogs?.length ?? 0} posts total</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
        >
          <PlusCircle size={15} aria-hidden="true" />
          Create New Blog
        </Link>
      </div>

      {!blogs?.length ? (
        <div className="admin-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">📝</p>
          <p className="font-semibold text-white">No blog posts yet</p>
          <p className="text-sm text-slate-400 mt-1">Create your first post to get started.</p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium truncate max-w-xs">{blog.title}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <Badge variant="default">{blog.category}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={blog.status === "published" ? "success" : "warning"}>
                        {blog.status}
                      </Badge>
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
