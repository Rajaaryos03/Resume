"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Send, Loader2, Crown } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  is_owner_reply: boolean;
  parent_id: string | null;
}

export default function BlogComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/blog/${slug}/comments`);
    const data = await res.json();
    setComments(data.comments ?? []);
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !content.trim()) {
      setError("Name and comment are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: name, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit.");
        return;
      }
      setSubmitted(true);
      setName("");
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  // Group: top-level comments + their replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const getReplies = (parentId: string) =>
    replies.filter((r) => r.parent_id === parentId);

  const CommentBubble = ({ c, isReply = false }: { c: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? "ml-10 mt-3" : ""}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold ${
          c.is_owner_reply
            ? "bg-gradient-to-br from-[#2F80ED] to-[#2563EB]"
            : "bg-gradient-to-br from-slate-500 to-slate-600"
        }`}
      >
        {c.is_owner_reply ? "RA" : c.author_name.charAt(0).toUpperCase()}
      </div>
      <div
        className={`flex-1 rounded-xl p-4 border ${
          c.is_owner_reply
            ? "bg-[#EFF6FF] border-[#BFDBFE]"
            : "bg-[#F8FAFC] border-[#E2E8F0]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-[#1E293B]">
            {c.is_owner_reply ? "Raja Aryos" : c.author_name}
          </span>
          {c.is_owner_reply && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2F80ED] bg-[#DBEAFE] px-1.5 py-0.5 rounded-full">
              <Crown size={9} />
              Author
            </span>
          )}
          <span className="text-xs text-[#94A3B8]">{formatDate(c.created_at)}</span>
        </div>
        <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
          {c.content}
        </p>
      </div>
    </div>
  );

  return (
    <section className="mt-12 pt-8 border-t border-[#E2E8F0]" aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="flex items-center gap-2 text-xl font-bold text-[#1E293B] mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <MessageSquare size={20} className="text-[#2F80ED]" aria-hidden="true" />
        {comments.length > 0
          ? `${topLevel.length} Comment${topLevel.length !== 1 ? "s" : ""}`
          : "Comments"}
      </h2>

      {/* Comment list */}
      {topLevel.length > 0 ? (
        <div className="space-y-5 mb-10">
          {topLevel.map((c) => (
            <div key={c.id}>
              <CommentBubble c={c} />
              {getReplies(c.id).map((r) => (
                <CommentBubble key={r.id} c={r} isReply />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#94A3B8] mb-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      {/* Comment form */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[#1E293B] mb-4">Leave a comment</h3>
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-semibold text-[#1E293B]">Comment submitted!</p>
            <p className="text-xs text-[#64748B] mt-1">It will appear after approval.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-3 text-xs text-[#2F80ED] hover:underline"
            >
              Write another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment-name" className="block text-xs font-semibold text-[#475569] mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="comment-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                maxLength={80}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED] transition"
              />
            </div>
            <div>
              <label htmlFor="comment-content" className="block text-xs font-semibold text-[#475569] mb-1">
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts…"
                required
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED] transition resize-none"
              />
              <p className="text-xs text-[#94A3B8] mt-1 text-right">{content.length}/1000</p>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none min-h-[44px]"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? "Submitting…" : "Submit Comment"}
              </button>
              <p className="text-xs text-[#94A3B8]">Reviewed before appearing.</p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
