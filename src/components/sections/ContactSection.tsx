import { Mail, Download } from "lucide-react";
import Section, { SectionHeader } from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Profile, CV } from "@/types";

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function MicrosoftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

interface ContactSectionProps {
  profile: Profile;
  cv: CV | null;
}

export default function ContactSection({ profile, cv }: ContactSectionProps) {
  const links = [
    profile.email && {
      icon: <Mail size={20} aria-hidden="true" />,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      external: false,
    },
    profile.linkedInUrl && {
      icon: <LinkedInIcon size={20} />,
      label: "LinkedIn",
      value: "View Profile",
      href: profile.linkedInUrl,
      external: true,
    },
    profile.githubUrl && {
      icon: <GitHubIcon size={20} />,
      label: "GitHub",
      value: "View Profile",
      href: profile.githubUrl,
      external: true,
    },
    profile.microsoftLearnUrl && {
      icon: <MicrosoftIcon size={20} />,
      label: "Microsoft Learn",
      value: "View Profile",
      href: profile.microsoftLearnUrl,
      external: true,
    },
  ].filter(Boolean) as Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
    href: string;
    external: boolean;
  }>;

  return (
    <Section id="contact" dark>
      <div className="max-w-2xl mx-auto text-center">
        <ScrollReveal variant="fade-up">
          <SectionHeader
            title="Get In Touch"
            subtitle="Open to new opportunities, collaborations, and conversations"
            className="text-center items-center"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {links.map((link, idx) => (
            <ScrollReveal key={link.label} variant="fade-up" delay={idx * 80}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[10px] p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56CCF2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A] min-h-[64px]"
                aria-label={`${link.label}: ${link.value}`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#2F80ED]/20 flex items-center justify-center text-[#56CCF2] shrink-0 group-hover:bg-[#2F80ED]/30 transition-colors">
                  {link.icon}
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 font-medium">{link.label}</p>
                  <p className="text-white text-sm font-semibold truncate">{link.value}</p>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {cv && (
          <ScrollReveal variant="fade-up" delay={200}>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-slate-400 text-sm mb-4">
                Want a quick overview of my background?
              </p>
              <a
                href="/api/cv/download"
                className="inline-flex items-center gap-2 bg-[#2F80ED] hover:bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-150 shadow-lg shadow-[#2F80ED]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56CCF2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A] min-h-[44px]"
                style={{ color: "#ffffff" }}
                aria-label="Download CV"
              >
                <Download size={16} aria-hidden="true" />
                Download CV — {cv.displayName}
              </a>
            </div>
          </ScrollReveal>
        )}
      </div>
    </Section>
  );
}
