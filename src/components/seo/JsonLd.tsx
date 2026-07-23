import type { Profile } from "@/types";

interface PersonJsonLdProps {
  profile: Profile;
  siteUrl?: string;
}

export function PersonJsonLd({ profile, siteUrl = "https://rajaaryos.dev" }: PersonJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    url: siteUrl,
    description: profile.shortBio,
    jobTitle: profile.professionalTitle,
    email: profile.email,
    image: profile.profileImageUrl ?? undefined,
    sameAs: [
      profile.linkedInUrl,
      profile.githubUrl,
      profile.microsoftLearnUrl,
    ].filter(Boolean),
    knowsAbout: profile.skills,
    ...(profile.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.location,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt?: string;
  updatedAt: string;
  coverImageUrl?: string;
  tags: string[];
  category: string;
  authorName: string;
  authorUrl?: string;
  siteUrl?: string;
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  publishedAt,
  updatedAt,
  coverImageUrl,
  tags,
  category,
  authorName,
  authorUrl = "https://rajaaryos.dev",
  siteUrl = "https://rajaaryos.dev",
}: ArticleJsonLdProps) {
  const url = `${siteUrl}/blog/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: excerpt,
    url,
    datePublished: publishedAt ?? updatedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: [category, ...tags].join(", "),
    articleSection: category,
    ...(coverImageUrl && {
      image: {
        "@type": "ImageObject",
        url: coverImageUrl,
        width: 1200,
        height: 630,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd({ siteUrl = "https://rajaaryos.dev", name = "Raja Aryos" }: { siteUrl?: string; name?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items, siteUrl = "https://rajaaryos.dev" }: {
  items: { name: string; path: string }[];
  siteUrl?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
