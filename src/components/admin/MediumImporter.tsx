"use client";

import { useState } from "react";
import {
  Loader2, Download, ExternalLink, CheckCircle, AlertCircle,
  FileText, Send, RefreshCw, Info,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface ImportResult { imported: number; skipped: number; total: number; }

const DB_MIGRATION = `ALTER TABLE blog
  ADD COLUMN IF NOT EXISTS medium_guid text,
  ADD COLUMN IF NOT EXISTS medium_url  text;

CREATE UNIQUE INDEX IF NOT EXISTS blog_medium_guid_idx
  ON blog(medium_guid)
  WHERE medium_guid IS NOT NULL;`;

type Tab = "import" | "publish" | "setup";

export default function MediumImporter() {
  const [tab, setTab] = useState<Tab>("import");

  // Import state
  const [username, setUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Publish state
  const [blogUrl, setBlogUrl] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // ── Import ──────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!username.trim()) { toast.error("Enter your Medium username."); return; }
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const res = await fetch("/api/medium/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.replace("@", "").trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Import failed.");
      setImportResult(data);
      toast.success(
        data.imported > 0
          ? `Imported ${data.imported} post${data.imported !== 1 ? "s" : ""} as drafts!`
          : "No new posts to import."
      );
    } catch (e) {
      const msg = String(e).replace("Error: ", "");
      setImportError(msg);
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  // ── Publish by blog ID extracted from admin URL ─────────────────────────────
  const extractBlogId = (val: string): string | null => {
    // Accept: UUID directly, or /admin/blog/<id>/edit URL
    const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    return val.match(uuidRe)?.[0] ?? null;
  };

  const handlePublish = async () => {
    const blogId = extractBlogId(blogUrl.trim());
    if (!blogId) {
      toast.error("Enter a valid blog post ID or its admin edit URL.");
      return;
    }
    setPublishing(true);
    setPublishedUrl(null);
    setPublishError(null);
    try {
      const res = await fetch("/api/medium/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Publish failed.");
      setPublishedUrl(data.mediumUrl);
      toast.success("Published to Medium!");
    } catch (e) {
      const msg = String(e).replace("Error: ", "");
      setPublishError(msg);
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "import",  label: "Import from Medium" },
    { id: "publish", label: "Publish to Medium" },
    { id: "setup",   label: "Setup & Migration" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Medium Integration
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Import posts from Medium or publish your portfolio posts to Medium.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-[#2F80ED] text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── IMPORT TAB ── */}
      {tab === "import" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3">
              Import Posts
            </h2>

            <div>
              <label htmlFor="medium-username" className="block text-sm font-semibold text-white mb-1.5">
                Medium Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                <input
                  id="medium-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                  placeholder="yourusername"
                  className="admin-input w-full pl-7 pr-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                From <code className="font-mono">medium.com/@yourusername</code>
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={importing || !username.trim()}
              className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none min-h-[44px]"
            >
              {importing ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {importing ? "Importing…" : "Import Posts"}
            </button>

            {importResult && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm font-semibold text-green-400">Import Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-3">
                  {[
                    { label: "Found",    value: importResult.total,    color: "text-white" },
                    { label: "Imported", value: importResult.imported, color: "text-green-400" },
                    { label: "Skipped",  value: importResult.skipped,  color: "text-slate-400" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                {importResult.imported > 0 && (
                  <Link
                    href="/admin/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#56CCF2] hover:text-white transition-colors"
                  >
                    <FileText size={12} /> Review imported drafts →
                  </Link>
                )}
              </div>
            )}

            {importError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-400 mb-1">Import Failed</p>
                    <p className="text-xs text-slate-400">{importError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="admin-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">How it works</h2>
            <ol className="space-y-3 text-sm text-slate-400">
              {[
                "Enter your Medium username and click Import",
                "Posts fetched directly from Medium's public RSS feed",
                "Each post saved as a Draft in your blog manager",
                "Review each post — edit, categorize, then publish",
                "Already-imported posts are skipped automatically on re-import",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#2F80ED]/20 text-[#56CCF2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ── PUBLISH TAB ── */}
      {tab === "publish" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3">
              Publish a Post to Medium
            </h2>

            <div className="bg-[#2F80ED]/10 border border-[#2F80ED]/20 rounded-lg p-3 flex gap-2">
              <Info size={15} className="text-[#56CCF2] mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300">
                Requires <code className="font-mono text-[#56CCF2]">MEDIUM_INTEGRATION_TOKEN</code> in your <code className="font-mono text-[#56CCF2]">.env.local</code>.
                See the <button onClick={() => setTab("setup")} className="text-[#56CCF2] hover:underline">Setup tab</button> for instructions.
              </p>
            </div>

            <div>
              <label htmlFor="blog-id" className="block text-sm font-semibold text-white mb-1.5">
                Blog Post ID or Edit URL
              </label>
              <input
                id="blog-id"
                type="text"
                value={blogUrl}
                onChange={(e) => setBlogUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePublish()}
                placeholder="Paste blog UUID or /admin/blog/<id>/edit URL"
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                Find the ID in the URL when editing a post:{" "}
                <span className="font-mono text-slate-400">/admin/blog/&lt;id&gt;/edit</span>
              </p>
            </div>

            <button
              onClick={handlePublish}
              disabled={publishing || !blogUrl.trim()}
              className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none min-h-[44px]"
            >
              {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {publishing ? "Publishing…" : "Publish to Medium"}
            </button>

            {publishedUrl && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm font-semibold text-green-400">Published!</span>
                </div>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#56CCF2] hover:text-white transition-colors break-all"
                >
                  <ExternalLink size={12} /> {publishedUrl}
                </a>
              </div>
            )}

            {publishError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-400 mb-1">Publish Failed</p>
                    <p className="text-xs text-slate-400">{publishError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="admin-card p-6">
              <h2 className="text-sm font-semibold text-white mb-4">How publishing works</h2>
              <ol className="space-y-3 text-sm text-slate-400">
                {[
                  "Write and save your blog post in the admin",
                  "Open the post editor — copy the ID from the URL",
                  "Paste it here and click Publish to Medium",
                  "The post is published with canonical URL pointing back to your portfolio",
                  "Medium URL is saved to the blog record automatically",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#2F80ED]/20 text-[#56CCF2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="admin-card p-5">
              <p className="text-xs text-slate-400 flex gap-2">
                <Info size={13} className="text-[#56CCF2] shrink-0 mt-0.5" />
                You can also publish directly from the blog post editor — look for the
                <strong className="text-white"> &quot;Publish to Medium&quot;</strong> button in the form toolbar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SETUP TAB ── */}
      {tab === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">

            <div className="admin-card p-6">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                1. Get your Medium Integration Token
              </h2>
              <ol className="space-y-2 text-sm text-slate-400 mb-4">
                {[
                  <>Go to <a href="https://medium.com/me/settings" target="_blank" rel="noopener noreferrer" className="text-[#56CCF2] hover:underline">medium.com/me/settings</a></>,
                  'Scroll to "Integration tokens"',
                  'Enter a description (e.g. "Portfolio") and click Get integration token',
                  "Copy the token",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#2F80ED]/20 text-[#56CCF2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <a
                href="https://medium.com/me/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#56CCF2] hover:text-white transition-colors"
              >
                <ExternalLink size={11} /> Open Medium Settings
              </a>
            </div>

            <div className="admin-card p-6">
              <h2 className="text-sm font-semibold text-white mb-3">2. Add to .env.local</h2>
              <pre className="bg-black/30 rounded-lg p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
{`# Medium integration
MEDIUM_INTEGRATION_TOKEN=your_token_here

# Optional: used for canonical URL when publishing
NEXT_PUBLIC_SITE_URL=https://yourdomain.com`}
              </pre>
              <p className="text-xs text-slate-400 mt-3">
                Restart the dev server after adding these variables.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="admin-card p-6">
              <h2 className="text-sm font-semibold text-white mb-3">3. Run DB Migration</h2>
              <p className="text-xs text-slate-400 mb-3">
                Run this once in your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#56CCF2] hover:underline">Supabase SQL editor</a>:
              </p>
              <pre className="bg-black/30 rounded-lg p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                {DB_MIGRATION}
              </pre>
            </div>

            <div className="admin-card p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Notes</h2>
              <ul className="space-y-2 text-xs text-slate-400">
                {[
                  "Canonical URL is set automatically so Google knows your portfolio is the original source.",
                  "Medium token gives full publish access — keep it secret, never commit to git.",
                  "Import works without a token — only publish requires it.",
                  "Posts are published as public by default.",
                ].map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#56CCF2] mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
