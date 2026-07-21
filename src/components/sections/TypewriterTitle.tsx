"use client";

import { useEffect, useRef } from "react";

const ROLES = [
  "Power Platform Developer",
  "Business Process Automation",
  "Copilot Studio Builder",
  "Dataverse Enthusiast",
  "Low-Code Engineer",
];

export default function TypewriterTitle() {
  const elRef = useRef<HTMLSpanElement>(null);
  const state = useRef({ txt: "", idx: 0, deleting: false });

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      if (!el) return;
      const { idx, deleting } = state.current;
      const full = ROLES[idx % ROLES.length];

      state.current.txt = deleting
        ? full.substring(0, state.current.txt.length - 1)
        : full.substring(0, state.current.txt.length + 1);

      el.textContent = state.current.txt;

      let speed = deleting ? 40 : 80;

      if (!deleting && state.current.txt === full) {
        speed = 2200;
        state.current.deleting = true;
      } else if (deleting && state.current.txt === "") {
        state.current.deleting = false;
        state.current.idx = idx + 1;
        speed = 400;
      }

      timer = setTimeout(tick, speed);
    }

    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="text-[#56CCF2]">
      <span ref={elRef} />
      <span className="typewriter-cursor">|</span>
    </span>
  );
}
