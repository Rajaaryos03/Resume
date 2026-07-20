import Image from "next/image";
import Link from "next/link";
import { Download, ArrowRight, Briefcase, BookOpen } from "lucide-react";
import type { Profile, CV } from "@/types";

interface HeroProps {
  profile: Profile;
  cv: CV | null;
}

export default function Hero({ profile, cv }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0B1F3A] via-[#102A43] to-[#0D2137] overflow-hidden"
      aria-label="Hero"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2F80ED]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#56CCF2]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-[#2F80ED]/20 border border-[#2F80ED]/30 text-[#56CCF2] text-sm font-medium px-3.5 py-1.5 rounded-full mb-5">
              <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" aria-hidden="true" />
              Available for opportunities
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)", color: "#ffffff" }}
            >
              Hi, I&apos;m{" "}
              <span style={{ color: "#2F80ED" }}>Raja Aryos</span>
            </h1>

            <p className="text-[#56CCF2] text-lg sm:text-xl font-medium mb-4" style={{ color: "#56CCF2" }}>
              {profile.professionalTitle}
            </p>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mb-8" style={{ color: "#CBD5E1" }}>
              {profile.shortBio}
            </p>

            {/* Skills chips */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
              {profile.skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="bg-white/10 border border-white/15 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {cv ? (
                <a
                  href="/api/cv/download"
                  className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-150 shadow-lg shadow-[#2F80ED]/25 hover:shadow-[#2F80ED]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56CCF2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A] min-h-[44px]"
                  style={{ color: "#ffffff" }}
                  aria-label="Download CV"
                >
                  <Download size={17} aria-hidden="true" />
                  Download CV
                </a>
              ) : (
                <span className="text-slate-500 text-sm italic">CV not available yet</span>
              )}
              <Link
                href="/#experience"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A] min-h-[44px]"
              >
                <Briefcase size={17} aria-hidden="true" />
                View Experience
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-4 py-3 rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A] min-h-[44px]"
              >
                <BookOpen size={17} aria-hidden="true" />
                Read Blog
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Profile image */}
          <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] rounded-full opacity-20 blur-xl" aria-hidden="true" />
              <div className="relative w-full h-full rounded-full border-4 border-[#2F80ED]/40 overflow-hidden bg-[#102A43]">
                {profile.profileImageUrl ? (
                  <Image
                    src={profile.profileImageUrl}
                    alt={`${profile.fullName} profile photo`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 208px, (max-width: 768px) 256px, 288px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="text-6xl sm:text-7xl font-bold text-[#2F80ED]"
                      style={{ fontFamily: "var(--font-heading)" }}
                      aria-hidden="true"
                    >
                      {profile.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden md:flex justify-center mt-16" aria-hidden="true">
          <div className="flex flex-col items-center gap-1.5 text-slate-500 text-xs">
            <span>Scroll to explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
