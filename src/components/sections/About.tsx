import Section, { SectionHeader } from "@/components/ui/Section";
import type { Profile } from "@/types";

export default function About({ profile }: { profile: Profile }) {
  return (
    <Section id="about">
      <div className="max-w-4xl">
        <SectionHeader title="About Me" subtitle="Professional background and areas of expertise" />

        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: profile.longDescription }}
        />

        {profile.skills.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Core Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-white/10 border border-white/15 text-slate-200 text-sm font-medium px-3 py-1.5 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {profile.location && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Location</span>
              <span className="text-white font-medium">{profile.location}</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Email</span>
            <a href={`mailto:${profile.email}`} className="text-[#56CCF2] font-medium hover:underline underline-offset-2">
              {profile.email}
            </a>
          </div>
          {profile.linkedInUrl && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">LinkedIn</span>
              <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-[#56CCF2] font-medium hover:underline underline-offset-2">
                View Profile
              </a>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
