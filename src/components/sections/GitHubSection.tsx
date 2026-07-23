import Section, { SectionHeader } from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GitHubActivity from "@/components/sections/GitHubActivity";

export default function GitHubSection() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  if (!username) return null;

  return (
    <Section id="github">
      <ScrollReveal variant="fade-up">
        <SectionHeader
          title="GitHub Activity"
          subtitle="Open-source contributions and public repositories"
        />
      </ScrollReveal>
      <ScrollReveal variant="fade-up" delay={100}>
        <GitHubActivity />
      </ScrollReveal>
    </Section>
  );
}
