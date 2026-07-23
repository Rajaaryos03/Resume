"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

function extractHeadings(html: string): Heading[] {
  const re = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
  const headings: Heading[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    const level = parseInt(m[1]) as 2 | 3;
    const rawText = m[3].replace(/<[^>]+>/g, "").trim();
    const id =
      m[2] ||
      rawText
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (rawText) headings.push({ id, text: rawText, level });
  }

  return headings;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings] = useState<Heading[]>(() => extractHeadings(content));
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0% -60% 0%", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <div className="flex items-center gap-2 mb-3">
        <List size={14} className="text-[#2F80ED]" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
          On this page
        </span>
      </div>

      <ul className="space-y-1 border-l border-[#E2E8F0]">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${id}`);
                }
              }}
              className={cn(
                "block py-1 pr-2 transition-all duration-150 leading-snug hover:text-[#2F80ED]",
                level === 2
                  ? "pl-3 text-[#475569] font-medium"
                  : "pl-6 text-[#94A3B8] text-xs",
                activeId === id
                  ? "text-[#2F80ED] border-l-2 border-[#2F80ED] -ml-px font-semibold"
                  : "border-l-2 border-transparent -ml-px"
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
