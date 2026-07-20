"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#certificates", label: "Certificates" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0B1F3A]/95 backdrop-blur-md shadow-lg"
          : "bg-[#0B1F3A]"
      )}
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-bold text-lg tracking-tight hover:text-[#56CCF2] transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Raja<span className="text-[#2F80ED]">.</span>dev
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/api/cv/download"
            className="ml-3 inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#56CCF2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A]"
            style={{ color: "#ffffff" }}
            aria-label="Download CV"
          >
            <Download size={15} aria-hidden="true" />
            Download CV
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#102A43] border-t border-white/10 px-4 pb-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-slate-300 hover:text-white py-3 border-b border-white/5 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/api/cv/download"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: "#ffffff" }}
          >
            <Download size={15} aria-hidden="true" />
            Download CV
          </Link>
        </div>
      )}
    </header>
  );
}
