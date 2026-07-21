import {
  getProfile,
  getPublishedExperiences,
  getPublishedCertificates,
  getFeaturedBlogs,
  getActiveCV,
  getPublishedProjects,
} from "@/lib/db";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import ExperienceSection from "@/components/sections/ExperienceSection";
import CertificateSection from "@/components/sections/CertificateSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import LatestBlogSection from "@/components/sections/LatestBlogSection";
import ContactSection from "@/components/sections/ContactSection";

export const revalidate = 60;

export default async function HomePage() {
  const [profile, experiences, certificates, blogs, cv, projects] = await Promise.all([
    getProfile(),
    getPublishedExperiences(),
    getPublishedCertificates(),
    getFeaturedBlogs(3),
    getActiveCV(),
    getPublishedProjects(),
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A]">
        <p className="text-slate-400 text-lg">Setting up portfolio…</p>
      </div>
    );
  }

  return (
    <>
      <Hero profile={profile} cv={cv} />
      <About profile={profile} />
      <ExperienceSection experiences={experiences} />
      <ProjectsSection projects={projects} />
      <CertificateSection certificates={certificates} />
      <LatestBlogSection blogs={blogs} />
      <ContactSection profile={profile} cv={cv} />
    </>
  );
}
