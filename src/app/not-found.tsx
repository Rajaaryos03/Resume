import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-[#2F80ED] mb-4" aria-hidden="true">404</p>
      <h1 className="text-2xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        Page Not Found
      </h1>
      <p className="text-[#64748B] mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
