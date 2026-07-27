import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section, { SectionHeader } from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BlogCard from "@/components/blog/BlogCard";
import type { Blog } from "@/types";

export default function LatestBlogSection({ blogs }: { blogs: Blog[] }) {
  if (!blogs.length) return null;

  return (
    <Section id="blog-preview" dark>
      <ScrollReveal variant="fade-up">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            title="Latest Articles"
            subtitle="Thoughts, tutorials, and insights on Power Platform and Microsoft tech"
            className="mb-0"
          />
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#56CCF2] hover:text-white transition-colors shrink-0 ml-6"
          >
            View all posts
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((blog, i) => (
          <ScrollReveal key={blog.id} variant="fade-up" delay={i * 100} threshold={0.1}>
            <BlogCard blog={blog} />
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#56CCF2] hover:text-white transition-colors">
          View all posts
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </Section>
  );
}
