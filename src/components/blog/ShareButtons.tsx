"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567 5.95-5.567Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface ShareButtonsProps {
  title: string;
  slug: string;
}

const BASE_URL = "https://rajaaryos.dev";

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE_URL}/blog/${slug}`;
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-[#64748B] font-medium">Share:</span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-[#475569] hover:bg-black hover:text-white hover:border-black text-xs font-medium transition-all duration-150"
        aria-label="Share on X"
      >
        <XIcon size={13} />
        X
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] text-xs font-medium transition-all duration-150"
        aria-label="Share on LinkedIn"
      >
        <LinkedInShareIcon size={13} />
        LinkedIn
      </a>

      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 ${
          copied
            ? "border-green-400 bg-green-50 text-green-600"
            : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2F80ED] hover:text-[#2F80ED]"
        }`}
        aria-label="Copy link"
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
