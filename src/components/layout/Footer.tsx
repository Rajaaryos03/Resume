import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { getProfile } from "@/lib/db";

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default async function Footer() {
  const year = new Date().getFullYear();
  const profile = await getProfile();

  return (
    <footer className="bg-[#0B1F3A] text-slate-400 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-white font-bold text-lg"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Raja<span className="text-[#2F80ED]">.</span>dev
            </Link>
            <p className="text-sm mt-1">
              {profile?.professionalTitle?.split("|")[0]?.trim() ?? "Power Platform Developer"} · {profile?.location ?? "Indonesia"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <Mail size={18} aria-hidden="true" />
              </a>
            )}
            {profile?.linkedInUrl && (
              <a
                href={profile.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <LinkedInIcon size={18} />
              </a>
            )}
            {profile?.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <GitHubIcon size={18} />
              </a>
            )}
            {profile?.microsoftLearnUrl && (
              <a
                href={profile.microsoftLearnUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Microsoft Learn"
                className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                <ExternalLink size={18} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
          © {year} Raja Aryos. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
