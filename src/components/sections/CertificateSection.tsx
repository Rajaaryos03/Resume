"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Award } from "lucide-react";
import Section, { SectionHeader } from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Badge from "@/components/ui/Badge";
import { formatMonthYear } from "@/lib/utils";
import type { Certificate, CertCategory } from "@/types";

const CATEGORIES: (CertCategory | "All")[] = ["All", "Microsoft", "Power Platform", "Cloud", "AI", "Other"];

export default function CertificateSection({ certificates }: { certificates: Certificate[] }) {
  const [active, setActive] = useState<CertCategory | "All">("All");
  const filtered = active === "All" ? certificates : certificates.filter((c) => c.category === active);

  if (!certificates.length) return null;

  return (
    <Section id="certificates">
      <ScrollReveal variant="fade-up">
        <SectionHeader title="Certifications" subtitle="Professional certifications and credentials" />
      </ScrollReveal>

      <ScrollReveal variant="fade-up" delay={100}>
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter certificates by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED] ${
                active === cat
                  ? "bg-[#2F80ED] text-white shadow-sm"
                  : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {filtered.length === 0 ? (
        <p className="text-slate-400 text-sm">No certificates in this category.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Certificate list">
          {filtered.map((cert, idx) => (
            <ScrollReveal key={cert.id} variant="zoom-in" delay={idx * 75} threshold={0.08}>
              <li>
                <article className="bg-white/5 border border-white/10 rounded-[10px] hover:bg-white/8 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">
                  <div className="h-36 bg-gradient-to-br from-[#2F80ED]/20 to-[#56CCF2]/10 flex items-center justify-center p-4">
                    {cert.certificateImageUrl ? (
                      <Image src={cert.certificateImageUrl} alt={`${cert.certificateName} badge`} width={120} height={120} className="object-contain max-h-28" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#2F80ED]/20 border-2 border-[#2F80ED]/30 flex items-center justify-center">
                        <Award size={28} className="text-[#56CCF2]" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
                        {cert.certificateName}
                      </h3>
                      {cert.category && <Badge variant="default" className="shrink-0 text-xs">{cert.category}</Badge>}
                    </div>

                    <p className="text-[#56CCF2] text-xs font-semibold mb-2">{cert.issuer}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
                      <span>Issued {formatMonthYear(cert.issueDate)}</span>
                      {cert.expirationDate && <span>Expires {formatMonthYear(cert.expirationDate)}</span>}
                    </div>

                    {cert.credentialId && (
                      <p className="text-xs text-slate-500 mb-3 font-mono truncate">ID: {cert.credentialId}</p>
                    )}

                    {cert.description && (
                      <p className="text-xs text-slate-400 leading-relaxed mb-3 flex-1">{cert.description}</p>
                    )}

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#56CCF2] hover:text-white transition-colors"
                        aria-label={`Verify credential: ${cert.certificateName}`}
                      >
                        <ExternalLink size={13} aria-hidden="true" />
                        Verify Credential
                      </a>
                    )}
                  </div>
                </article>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      )}
    </Section>
  );
}
