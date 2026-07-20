import Section, { SectionHeader } from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import { formatMonthYear } from "@/lib/utils";
import type { Experience } from "@/types";

export default function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  if (!experiences.length) return null;

  return (
    <Section id="experience" dark>
      <SectionHeader title="Experience" subtitle="My professional journey and key achievements" />

      <div className="relative">
        <div
          className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#2F80ED] via-[#2F80ED]/40 to-transparent hidden sm:block"
          aria-hidden="true"
        />

        <ol className="space-y-8" aria-label="Work experience">
          {experiences.map((exp, idx) => (
            <li key={exp.id} className="relative flex gap-6 sm:gap-8">
              <div
                className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-[#2F80ED] border-4 border-[#060F1E] items-center justify-center shadow-md z-10"
                aria-hidden="true"
                style={{ marginTop: "2px" }}
              >
                <span className="text-white text-xs font-bold">{idx + 1}</span>
              </div>

              <article className="flex-1 bg-white/5 border border-white/10 rounded-[10px] p-5 sm:p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                      {exp.roleTitle}
                    </h3>
                    <p className="text-[#56CCF2] font-semibold text-sm">{exp.company}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/15 whitespace-nowrap">
                      {formatMonthYear(exp.startDate)} — {exp.isCurrentRole ? "Present" : exp.endDate ? formatMonthYear(exp.endDate) : "Present"}
                    </span>
                    {exp.employmentType && (
                      <Badge variant="default" className="capitalize">{exp.employmentType.replace("-", " ")}</Badge>
                    )}
                  </div>
                </div>

                {exp.location && (
                  <p className="text-xs text-slate-400 mb-3">📍 {exp.location}</p>
                )}

                <p className="text-slate-300 text-sm leading-relaxed mb-4">{exp.description}</p>

                {exp.achievements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Key Achievements</h4>
                    <ul className="space-y-1">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-[#10B981] mt-0.5 shrink-0" aria-hidden="true">✓</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span key={tech} className="bg-white/10 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-md border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
