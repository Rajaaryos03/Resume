"use client";

import { useEffect, useState, useCallback } from "react";

const EMOJIS = ["👍", "❤️", "🔥", "🤔", "👏"] as const;

function getFingerprint(): string {
  const key = "blog_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, fp);
  }
  return fp;
}

export default function BlogReactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const fetchReactions = useCallback(async () => {
    const res = await fetch(`/api/blog/${slug}/reactions`);
    const data = await res.json();
    setCounts(data.counts ?? {});
  }, [slug]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggle = async (emoji: string) => {
    if (loading) return;
    const fp = getFingerprint();
    setLoading(emoji);

    const isReacted = reacted.has(emoji);
    setReacted((prev) => {
      const next = new Set(prev);
      isReacted ? next.delete(emoji) : next.add(emoji);
      return next;
    });
    setCounts((prev) => ({
      ...prev,
      [emoji]: Math.max(0, (prev[emoji] ?? 0) + (isReacted ? -1 : 1)),
    }));

    try {
      await fetch(`/api/blog/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji, fingerprint: fp }),
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-6 border-t border-[#E2E8F0]">
      <span className="text-sm text-[#64748B] font-medium mr-1">React:</span>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => toggle(emoji)}
          disabled={!!loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 select-none ${
            reacted.has(emoji)
              ? "bg-[#EFF6FF] border-[#2F80ED] text-[#2F80ED] scale-105"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:border-[#2F80ED]/50 hover:bg-[#EFF6FF]/50"
          } ${loading === emoji ? "opacity-60" : ""}`}
        >
          <span>{emoji}</span>
          {(counts[emoji] ?? 0) > 0 && (
            <span className="text-xs">{counts[emoji]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
