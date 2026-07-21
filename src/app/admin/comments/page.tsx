import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import AdminCommentList from "@/components/admin/AdminCommentList";

export const metadata: Metadata = { title: "Manage Comments" };

async function approveComments(ids: string[]) {
  "use server";
  const supabase = await createAdminClient();
  await supabase.from("blog_comment").update({ is_approved: true }).in("id", ids);
  revalidatePath("/admin/comments");
}

async function deleteComments(ids: string[]) {
  "use server";
  const supabase = await createAdminClient();
  await supabase.from("blog_comment").delete().in("id", ids);
  revalidatePath("/admin/comments");
}

async function replyToComment(parentId: string, blogId: string, content: string) {
  "use server";
  if (!content.trim()) return;
  const supabase = await createAdminClient();

  // Auto-approve the parent comment when replying
  await supabase
    .from("blog_comment")
    .update({ is_approved: true })
    .eq("id", parentId);

  // Insert the reply (also auto-approved, visible immediately)
  await supabase.from("blog_comment").insert({
    blog_id: blogId,
    parent_id: parentId,
    author_name: "Raja Aryos",
    content: content.trim(),
    is_approved: true,
    is_owner_reply: true,
  });

  revalidatePath("/admin/comments");
  revalidatePath("/blog");
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showPendingOnly = filter === "pending";

  const supabase = await createAdminClient();
  const { data: comments } = await supabase
    .from("blog_comment")
    .select("id, author_name, author_email, content, is_approved, created_at, blog_id, blog(title, slug)")
    .order("created_at", { ascending: false });

  // Safe defaults for columns added by migration
  const list = (comments ?? []).map((c) => ({
    ...c,
    is_owner_reply: (c as Record<string, unknown>).is_owner_reply ?? false,
    parent_id: (c as Record<string, unknown>).parent_id ?? null,
  }));
  const pending = list.filter((c) => !c.is_approved && !c.is_owner_reply).length;
  const approved = list.filter((c) => c.is_approved).length;

  const displayed = showPendingOnly
    ? list.filter((c) => !c.is_approved && !c.is_owner_reply)
    : list;

  // Map comment id → blog_id for reply action
  const commentBlogIds: Record<string, string> = {};
  for (const c of list) {
    commentBlogIds[c.id] = c.blog_id;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Comments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {pending} pending · {approved} approved
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 p-1 rounded-lg w-fit">
        <Link
          href="/admin/comments"
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            !showPendingOnly ? "bg-[#2F80ED] text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          All ({list.length})
        </Link>
        <Link
          href="/admin/comments?filter=pending"
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            showPendingOnly ? "bg-[#2F80ED] text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Pending {pending > 0 && <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending}</span>}
        </Link>
      </div>

      {displayed.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-white">
            {showPendingOnly ? "No pending comments" : "No comments yet"}
          </p>
        </div>
      ) : (
        <AdminCommentList
          comments={displayed as unknown as Parameters<typeof AdminCommentList>[0]["comments"]}
          approveAction={approveComments}
          deleteAction={deleteComments}
          replyAction={replyToComment}
          commentBlogIds={commentBlogIds}
        />
      )}
    </div>
  );
}
