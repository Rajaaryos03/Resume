"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { upsertProject } from "@/lib/actions";
import type { Project } from "@/types";

const CATEGORIES = [
  "Power Platform",
  "Power Apps",
  "Power Automate",
  "Dataverse",
  "Copilot Studio",
  "SharePoint",
  "Full Stack",
  "AI / ML",
  "Other",
];

interface ProjectFormProps {
  project?: Project;
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }
      setImageUrl(data.url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);

    startTransition(async () => {
      const result = await upsertProject(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(project ? "Project updated!" : "Project created!");
        router.push("/admin/project");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/project"
          className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Back to projects"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {project ? "Edit Project" : "Add New Project"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {project && <input type="hidden" name="id" value={project.id} />}

        <div className="admin-card p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-3">
            Project Details
          </h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-white mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={project?.title ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="My Power Apps Project"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-white mb-1.5">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={2}
              defaultValue={project?.description ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none focus:outline-none transition"
              placeholder="A brief description of this project…"
            />
          </div>

          {/* Long Description */}
          <div>
            <label htmlFor="longDescription" className="block text-sm font-semibold text-white mb-1.5">
              Full Description
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              rows={5}
              defaultValue={project?.longDescription ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm resize-y focus:outline-none transition"
              placeholder="Detailed description, problem solved, approach taken…"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue={project?.category ?? "Power Platform"}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-white mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue={project?.status ?? "published"}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition bg-white"
              >
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label htmlFor="technologies" className="block text-sm font-semibold text-white mb-1.5">
              Technologies
            </label>
            <input
              id="technologies"
              name="technologies"
              type="text"
              defaultValue={project?.technologies.join(", ") ?? ""}
              className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              placeholder="Power Apps, Dataverse, Power Automate"
            />
            <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="demoUrl" className="block text-sm font-semibold text-white mb-1.5">
                Demo URL
              </label>
              <input
                id="demoUrl"
                name="demoUrl"
                type="url"
                defaultValue={project?.demoUrl ?? ""}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
                placeholder="https://…"
              />
            </div>
            <div>
              <label htmlFor="repoUrl" className="block text-sm font-semibold text-white mb-1.5">
                Repository URL
              </label>
              <input
                id="repoUrl"
                name="repoUrl"
                type="url"
                defaultValue={project?.repoUrl ?? ""}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
                placeholder="https://github.com/…"
              />
            </div>
          </div>

          {/* Sort Order + Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-semibold text-white mb-1.5">
                Sort Order
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={project?.sortOrder ?? 0}
                className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={project?.featured ?? false}
                  className="w-4 h-4 rounded accent-[#2F80ED]"
                />
                <span className="text-sm font-semibold text-white">Featured project</span>
              </label>
            </div>
          </div>

          {/* Project Image */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Project Image
            </label>
            {imageUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/15">
                <Image
                  src={imageUrl}
                  alt="Project preview"
                  fill
                  className="object-cover"
                  sizes="600px"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/20 hover:border-[#2F80ED]/60 rounded-lg py-8 text-slate-400 hover:text-[#2F80ED] transition-colors"
              >
                {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                <span className="text-sm">{uploadingImage ? "Uploading…" : "Click to upload project image"}</span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] min-h-[44px]"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? "Saving…" : project ? "Update Project" : "Create Project"}
          </button>
          <Link
            href="/admin/project"
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[44px]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
