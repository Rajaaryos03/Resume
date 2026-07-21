"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
