"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  id: string;
  label: string;
  deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function DeleteButton({ id, label, deleteAction }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deleted successfully");
      }
    } catch {
      toast.error("Delete failed. Please try again.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2.5 py-1.5 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[32px]"
          aria-label={`Confirm delete: ${label}`}
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            "Confirm"
          )}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1.5 rounded bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[32px]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      aria-label={`Delete: ${label}`}
    >
      <Trash2 size={15} aria-hidden="true" />
    </button>
  );
}
