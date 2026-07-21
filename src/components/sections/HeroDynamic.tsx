"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const TypewriterTitle = dynamic(
  () => import("@/components/sections/TypewriterTitle"),
  {
    ssr: false,
    loading: () => <span className="text-[#56CCF2] opacity-0">|</span>,
  }
);

export const TerminalWindow = dynamic(
  () => import("@/components/sections/TerminalWindow"),
  {
    ssr: false,
    loading: () => (
      <div className="terminal-window w-full max-w-sm h-[160px] flex items-center justify-center">
        <Loader2 size={16} className="animate-spin text-slate-600" />
      </div>
    ),
  }
);
