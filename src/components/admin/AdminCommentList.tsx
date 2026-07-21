"use client";

import { useState, useTransition } from "react";
import { Check, Trash2, Reply, Loader2, Send, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface Blog {
  title: string;
  slug: string;
}

interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  content: string;
  is_approved: boolean;
  is_owner_reply: boolean;
  parent_id: string | null;
  created_at: string;
  blog: Blog | Blog[] | null;
}

interface AdminCommentListProps {
  comments: Comment[];
  approveAction: (ids: string[]) => Promise<void>;
  deleteAction: (ids: string[]) => Promise<void>;
  replyAction: (parentId: string, blogId: string, content: string) => Promise<void>;
  commentBlogIds: Record<string, string>;
}

export default function AdminCommentList({
  comments,
  approveAction,
  deleteAction,
  replyAction,
  commentBlogIds,
}: AdminCommentListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      selected.size === comments.length
        ? new Set()
        : new Set(comments.map((c) => c.id))
    );
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selected);
    startTransition(async () => {
      await approveAction(ids);
      setSelected(new Set());
    });
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.size} comment(s)?`)) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteAction(ids);
      setSelected(new Set());
    });
  };

  const handleReply = (commentId: string) => {
    const blogId = commentBlogIds[commentId];
    if (!blogId) return;
    startTransition(async () => {
      await replyAction(commentId, blogId, replyContent.trim());
      setReplyingTo(null);
      setReplyContent("");
    });
  };

  // owner replies always nested, even pre-migration when parent_id is null
  const topLevel = comments.filter((c) => !c.is_owner_reply && !c.parent_id);
  const allReplies = comments.filter((c) => c.is_owner_reply || c.parent_id);
  const getReplies = (id: string) =>
    allReplies.filter((r) => r.parent_id === id);

  const pendingCount = comments.filter((c) => !c.is_approved && !c.is_owner_reply).length;
  const hasSelected = selected.size > 0;
  const allPending = Array.from(selected).every((id) => {
    const c = comments.find((x) => x.id === id);
    return c && !c.is_approved;
  });

  return (
    <div>
      {/* Bulk toolbar */}
      {hasSelected && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#2F80ED]/10 border border-[#2F80ED]/30 rounded-lg">
          <span className="text-sm text-white font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {allPending && (
              <button
                onClick={handleBulkApprove}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Check size={13} /> Approve all
              </button>
            )}
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} /> Delete all
            </button>
            <button onClick={() => setSelected(new Set())} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Select all */}
      {comments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <input
            type="checkbox"
            id="select-all"
            checked={selected.size === comments.length && comments.length > 0}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-[#2F80ED]"
          />
          <label htmlFor="select-all" className="text-xs text-slate-500 cursor-pointer">
            Select all · {pendingCount} pending
          </label>
        </div>
      )}

      {/* Comment cards */}
      <div className="space-y-4">
        {topLevel.map((c) => {
          const blog = Array.isArray(c.blog) ? c.blog[0] : c.blog;
          const commentReplies = getReplies(c.id);

          return (
            <div key={c.id} className="admin-card overflow-hidden">

              {/* ── Blog context banner ── */}
              {blog && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-white/10">
                  <div className="w-1 h-4 rounded-full bg-[#2F80ED] shrink-0" />
                  <span className="text-xs text-slate-400">Comment on:</span>
                  <Link
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-[#56CCF2] hover:text-white transition-colors flex items-center gap-1 truncate"
                  >
                    {blog.title}
                    <ExternalLink size={10} className="shrink-0" />
                  </Link>
                </div>
              )}

              {/* ── Main comment ── */}
              <div className="p-4 flex gap-3">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  className="w-4 h-4 rounded accent-[#2F80ED] mt-1 shrink-0"
                />

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                  {c.author_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-white text-sm">{c.author_name}</span>
                    <Badge variant={c.is_approved ? "success" : "warning"}>
                      {c.is_approved ? "Approved" : "Pending"}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatDate(c.created_at)}</span>
                  </div>

                  {/* Comment body */}
                  <div className="bg-white/5 rounded-lg px-3 py-2.5 border border-white/8">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {!c.is_approved && (
                    <button
                      onClick={() => startTransition(() => approveAction([c.id]))}
                      disabled={isPending}
                      title="Approve"
                      className="p-2 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyContent(""); }}
                    title="Reply as Raja Aryos"
                    className={`p-2 rounded-lg transition-colors ${replyingTo === c.id ? "text-[#56CCF2] bg-white/10" : "text-slate-400 hover:text-[#56CCF2] hover:bg-white/10"}`}
                  >
                    <Reply size={15} />
                  </button>
                  <button
                    onClick={() => { if (!confirm("Delete this comment?")) return; startTransition(() => deleteAction([c.id])); }}
                    disabled={isPending}
                    title="Delete"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* ── Existing replies ── */}
              {commentReplies.length > 0 && (
                <div className="border-t border-white/8 bg-[#0B1F3A]/50 divide-y divide-white/5">
                  {commentReplies.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                      {/* Indent line */}
                      <div className="flex flex-col items-center gap-0 mt-1 shrink-0 ml-7">
                        <div className="w-px h-3 bg-[#2F80ED]/40" />
                        <div className="w-3 h-px bg-[#2F80ED]/40" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#2F80ED] flex items-center justify-center shrink-0 text-white text-xs font-bold">
                        RA
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#56CCF2]">Raja Aryos</span>
                          <span className="text-[10px] text-slate-500">{formatDate(r.created_at)}</span>
                          <span className="text-[10px] bg-[#2F80ED]/20 text-[#56CCF2] px-1.5 py-0.5 rounded-full font-medium">Author reply</span>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{r.content}</p>
                      </div>
                      <button
                        onClick={() => { if (!confirm("Delete this reply?")) return; startTransition(() => deleteAction([r.id])); }}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Delete reply"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Reply form ── */}
              {replyingTo === c.id && (
                <div className="border-t border-[#2F80ED]/20 bg-[#2F80ED]/5 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                    <Reply size={11} className="text-[#2F80ED]" />
                    Replying as <span className="text-[#56CCF2] font-semibold">Raja Aryos</span>
                    {blog && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{blog.title}</span>
                      </>
                    )}
                  </p>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply…"
                    rows={3}
                    maxLength={1000}
                    className="admin-input w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none transition"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleReply(c.id)}
                      disabled={isPending || !replyContent.trim()}
                      className="inline-flex items-center gap-1.5 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Send Reply
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                      className="text-xs text-slate-400 hover:text-white transition-colors px-2"
                    >
                      Cancel
                    </button>
                    <span className="text-xs text-slate-600 ml-auto">{replyContent.length}/1000</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
