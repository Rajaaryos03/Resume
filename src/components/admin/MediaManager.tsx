"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Loader2, Trash2, Copy, Check, Upload, ImageIcon, RefreshCw, Search, X } from "lucide-react";
import toast from "react-hot-toast";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles(data.files ?? []);
    } catch (e) {
      toast.error("Failed to load media: " + String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const file = fileList[0];
    if (!file.type.startsWith("image/")) { toast.error("Only images allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB per image."); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) { toast.error(data.error ?? "Upload failed."); return; }
      toast.success("Uploaded!");
      await fetchFiles();
    } catch { toast.error("Upload failed."); }
    finally { setUploading(false); }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setDeletingPath(file.path);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: file.path }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { toast.error(data.error ?? "Delete failed."); return; }
      toast.success("Deleted.");
      if (selectedFile?.path === file.path) setSelectedFile(null);
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
    } catch { toast.error("Delete failed."); }
    finally { setDeletingPath(null); }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Media Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {files.length} image{files.length !== 1 ? "s" : ""} in storage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => uploadRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60 min-h-[44px]"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? "Uploading…" : "Upload Image"}
          </button>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search images…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input w-full pl-9 pr-9 py-2.5 rounded-lg border text-sm focus:outline-none transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#2F80ED]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? "No images match your search." : "No images uploaded yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((file) => (
            <div
              key={file.path}
              onClick={() => setSelectedFile(selectedFile?.path === file.path ? null : file)}
              className={`group relative bg-white/5 border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 ${
                selectedFile?.path === file.path
                  ? "border-[#2F80ED] ring-2 ring-[#2F80ED]/40"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div className="relative aspect-square bg-white/5">
                <Image
                  src={file.url}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-white font-medium truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleCopy(file.url); }}
                  className="p-2 bg-white/20 hover:bg-[#2F80ED] rounded-lg transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl === file.url ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                  disabled={deletingPath === file.path}
                  className="p-2 bg-white/20 hover:bg-red-500/70 rounded-lg transition-colors"
                  title="Delete"
                >
                  {deletingPath === file.path
                    ? <Loader2 size={14} className="animate-spin text-white" />
                    : <Trash2 size={14} className="text-white" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selectedFile && (
        <div className="mt-6 admin-card p-5 flex flex-col sm:flex-row gap-6">
          <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-white/5 shrink-0">
            <Image src={selectedFile.url} alt={selectedFile.name} fill className="object-contain" sizes="200px" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Filename</p>
              <p className="text-white text-sm font-mono break-all">{selectedFile.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Size</p>
              <p className="text-white text-sm">{formatBytes(selectedFile.size)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Type</p>
              <p className="text-white text-sm">{selectedFile.mimetype}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">URL</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedFile.url}
                  className="admin-input flex-1 px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(selectedFile.url)}
                  className="p-2 bg-[#2F80ED] hover:bg-[#2563EB] rounded-lg transition-colors"
                >
                  {copiedUrl === selectedFile.url ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <a
                href={selectedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#56CCF2] hover:text-white transition-colors"
              >
                Open in new tab ↗
              </a>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => handleDelete(selectedFile)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
