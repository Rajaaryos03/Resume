"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

const MIGRATIONS = [
  {
    id: "comment_reply_columns",
    label: "Comment reply columns",
    status: "required",
    description: "Adds parent_id and is_owner_reply to blog_comment. Required for reply feature.",
    sql: `ALTER TABLE blog_comment ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES blog_comment(id) ON DELETE CASCADE;
ALTER TABLE blog_comment ADD COLUMN IF NOT EXISTS is_owner_reply boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS blog_comment_parent_idx ON blog_comment(parent_id);`,
  },
  {
    id: "blog_series",
    label: "Blog series table",
    status: "required",
    description: "Creates blog_series table and adds series_id, series_order to blog.",
    sql: `CREATE TABLE IF NOT EXISTS blog_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blog_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read series" ON blog_series FOR SELECT USING (true);
ALTER TABLE blog ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES blog_series(id) ON DELETE SET NULL;
ALTER TABLE blog ADD COLUMN IF NOT EXISTS series_order integer;`,
  },
  {
    id: "blog_reactions",
    label: "Blog reactions table",
    status: "required",
    description: "Creates blog_reaction table for emoji reactions.",
    sql: `CREATE TABLE IF NOT EXISTS blog_reaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid NOT NULL REFERENCES blog(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (emoji IN ('👍','❤️','🔥','🤔','👏')),
  fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blog_id, emoji, fingerprint)
);
CREATE INDEX IF NOT EXISTS blog_reaction_blog_idx ON blog_reaction(blog_id);
ALTER TABLE blog_reaction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reactions" ON blog_reaction FOR SELECT USING (true);
CREATE POLICY "Public insert reactions" ON blog_reaction FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete own reaction" ON blog_reaction FOR DELETE USING (true);`,
  },
  {
    id: "blog_comments",
    label: "Blog comments table",
    status: "required",
    description: "Creates blog_comment table for reader comments.",
    sql: `CREATE TABLE IF NOT EXISTS blog_comment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid NOT NULL REFERENCES blog(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES blog_comment(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  is_owner_reply boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_comment_blog_idx ON blog_comment(blog_id);
CREATE INDEX IF NOT EXISTS blog_comment_parent_idx ON blog_comment(parent_id);
ALTER TABLE blog_comment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved comments" ON blog_comment FOR SELECT USING (is_approved = true);
CREATE POLICY "Public insert comments" ON blog_comment FOR INSERT WITH CHECK (true);`,
  },
  {
    id: "view_count",
    label: "Blog view count",
    status: "required",
    description: "Adds view_count column and increment RPC to blog table.",
    sql: `ALTER TABLE blog ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0 NOT NULL;
CREATE OR REPLACE FUNCTION increment_blog_views(blog_slug text)
RETURNS void AS $$
BEGIN
  UPDATE blog SET view_count = view_count + 1 WHERE slug = blog_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
  },
  {
    id: "project_table",
    label: "Project table",
    status: "required",
    description: "Creates project table for portfolio projects.",
    sql: `CREATE TABLE IF NOT EXISTS project (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  technologies text[] DEFAULT '{}',
  category text NOT NULL DEFAULT 'Power Platform',
  demo_url text,
  repo_url text,
  image_url text,
  featured boolean DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published projects" ON project FOR SELECT USING (status = 'published');`,
  },
  {
    id: "availability_status",
    label: "Profile availability status",
    status: "required",
    description: "Adds availability_status to profile for hero badge.",
    sql: `ALTER TABLE profile ADD COLUMN IF NOT EXISTS availability_status text;`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy SQL"}
    </button>
  );
}

export default function MigrationsClient() {
  const [runResults, setRunResults] = useState<Record<string, "running" | "ok" | "error">>({});

  const runMigration = async (id: string, sql: string) => {
    setRunResults((p) => ({ ...p, [id]: "running" }));
    try {
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ migration: id }),
      });
      setRunResults((p) => ({ ...p, [id]: res.ok ? "ok" : "error" }));
    } catch {
      setRunResults((p) => ({ ...p, [id]: "error" }));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Database Migrations
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Run these in order. Safe to re-run — all use <code className="bg-white/10 px-1 rounded text-xs">IF NOT EXISTS</code>.
        </p>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#56CCF2] hover:underline"
        >
          <ExternalLink size={11} />
          Open Supabase SQL Editor (recommended)
        </a>
      </div>

      <div className="space-y-3">
        {MIGRATIONS.map((m) => {
          const result = runResults[m.id];
          return (
            <div key={m.id} className="admin-card p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{m.label}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium uppercase">
                      {m.status}
                    </span>
                    {result === "ok" && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">✓ Applied</span>
                    )}
                    {result === "error" && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium">✗ Error — copy & run manually</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={m.sql} />
                  <button
                    onClick={() => runMigration(m.id, m.sql)}
                    disabled={result === "running"}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#2F80ED] hover:bg-[#2563EB] text-white transition-colors disabled:opacity-50"
                  >
                    {result === "running" ? "Running…" : "Run"}
                  </button>
                </div>
              </div>
              <pre className="text-xs text-slate-400 bg-[#0B1F3A] rounded-lg p-3 overflow-x-auto font-mono whitespace-pre-wrap">
                {m.sql}
              </pre>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg">
        <p className="text-xs text-amber-400 font-semibold mb-1">⚠️ If "Run" fails</p>
        <p className="text-xs text-slate-400">
          Copy the SQL and paste it into{" "}
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#56CCF2] hover:underline">
            Supabase Dashboard → SQL Editor → New query → Run
          </a>
          . This is the most reliable method.
        </p>
      </div>
    </div>
  );
}
