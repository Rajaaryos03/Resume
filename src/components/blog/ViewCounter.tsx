"use client";

import { useEffect, useRef } from "react";

export default function ViewCounter({ slug }: { slug: string }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    fetch(`/api/blog/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
