"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
      } else {
        router.push(redirect);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1E293B] border border-white/10 rounded-[16px] p-6 shadow-xl"
      aria-label="Admin login form"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-white mb-1.5">
            Email
          </label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email"
            className="admin-input w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none transition"
            placeholder="admin@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-white mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password" type={showPw ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password"
              className="admin-input w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none transition"
              placeholder="••••••••"
            />
            <button
              type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-500/15 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E293B] min-h-[44px]"
          style={{ color: "#ffffff" }}
        >
          {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] to-[#102A43] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Raja<span className="text-[#2F80ED]">.</span>admin
          </h1>
          <p className="text-slate-400 text-sm">Sign in to manage your portfolio</p>
        </div>
        <Suspense fallback={<div className="bg-[#1E293B] border border-white/10 rounded-[16px] p-6 h-48 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
