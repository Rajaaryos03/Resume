import Image from "next/image";
import Link from "next/link";
import { ExternalLink, GitBranch } from "lucide-react";
import Section, { SectionHeader } from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Badge from "@/components/ui/Badge";
import type { Project } from "@/types";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" dark>
      <ScrollReveal variant="fade-up">
        <SectionHeader
          title="Projects"
          subtitle="A selection of things I've built"
        />
      </ScrollReveal>

      {/* Featured projects */}
      {featured.length > 0 && (
        <div className="space-y-8 mb-12">
          {featured.map((project, idx) => (
            <ScrollReveal key={project.id} variant="fade-up" delay={idx * 100} threshold={0.1}>
              <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#2F80ED]/40 transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  {project.imageUrl && (
                    <div className="relative w-full md:w-80 h-52 md:h-auto shrink-0 overflow-hidden">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-between p-6 flex-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="default">{project.category}</Badge>
                        <Badge variant="navy">Featured</Badge>
                      </div>
                      <h3
                        className="text-xl font-bold text-white mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="bg-white/8 border border-white/10 text-slate-300 text-xs px-2.5 py-1 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      {project.demoUrl && (
                        <Link
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#2F80ED] hover:bg-[#2563EB] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                          Live Demo
                        </Link>
                      )}
                      {project.repoUrl && (
                        <Link
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <GitBranch size={13} aria-hidden="true" />
                          Source
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Rest of projects */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((project, idx) => (
            <ScrollReveal key={project.id} variant="zoom-in" delay={idx * 80} threshold={0.1}>
              <div className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#2F80ED]/40 transition-all duration-300 flex flex-col h-full">
                {project.imageUrl && (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="navy">{project.category}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="bg-white/8 border border-white/10 text-slate-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-xs text-slate-500">+{project.technologies.length - 4}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    {project.demoUrl && (
                      <Link
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#56CCF2] hover:text-white text-xs font-semibold transition-colors"
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                        Demo
                      </Link>
                    )}
                    {project.repoUrl && (
                      <Link
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                      >
                        <GitBranch size={12} aria-hidden="true" />
                        Source
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </Section>
  );
}
