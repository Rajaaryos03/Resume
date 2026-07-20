import { createClient } from "@/lib/supabase/server";
import type { Blog, Certificate, CV, Experience, Profile } from "@/types";

// ──────────────────────────────
// PROFILE
// ──────────────────────────────
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  if (!data) return null;
  return mapProfile(data);
}

// ──────────────────────────────
// BLOG (public)
// ──────────────────────────────
export async function getPublishedBlogs(opts?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ blogs: Blog[]; total: number }> {
  const supabase = await createClient();
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 9;
  const from = (page - 1) * limit;

  let query = supabase
    .from("blog")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts?.category && opts.category !== "All") {
    query = query.eq("category", opts.category);
  }
  if (opts?.search) {
    query = query.or(
      `title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`
    );
  }

  const { data, count } = await query.range(from, from + limit - 1);
  return {
    blogs: (data ?? []).map(mapBlog),
    total: count ?? 0,
  };
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (!data) return null;
  return mapBlog(data);
}

export async function getFeaturedBlogs(limit = 3): Promise<Blog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapBlog);
}

// ──────────────────────────────
// EXPERIENCE (public)
// ──────────────────────────────
export async function getPublishedExperiences(): Promise<Experience[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experience")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("is_current_role", { ascending: false })
    .order("start_date", { ascending: false });
  return (data ?? []).map(mapExperience);
}

// ──────────────────────────────
// CERTIFICATE (public)
// ──────────────────────────────
export async function getPublishedCertificates(category?: string): Promise<Certificate[]> {
  const supabase = await createClient();
  let query = supabase
    .from("certificate")
    .select("*")
    .eq("status", "published")
    .order("issue_date", { ascending: false });

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return (data ?? []).map(mapCertificate);
}

// ──────────────────────────────
// CV (public)
// ──────────────────────────────
export async function getActiveCV(): Promise<CV | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cv")
    .select("*")
    .eq("is_active", true)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .single();
  if (!data) return null;
  return mapCV(data);
}

// ──────────────────────────────
// MAPPERS (snake_case → camelCase)
// ──────────────────────────────
function mapProfile(d: Record<string, unknown>): Profile {
  return {
    id: d.id as string,
    fullName: d.full_name as string,
    professionalTitle: d.professional_title as string,
    shortBio: d.short_bio as string,
    longDescription: d.long_description as string,
    email: d.email as string,
    location: d.location as string | undefined,
    linkedInUrl: d.linked_in_url as string | undefined,
    githubUrl: d.github_url as string | undefined,
    microsoftLearnUrl: d.microsoft_learn_url as string | undefined,
    profileImageUrl: d.profile_image_url as string | undefined,
    skills: (d.skills as string[]) ?? [],
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function mapBlog(d: Record<string, unknown>): Blog {
  return {
    id: d.id as string,
    title: d.title as string,
    slug: d.slug as string,
    excerpt: d.excerpt as string,
    content: d.content as string,
    category: d.category as Blog["category"],
    tags: (d.tags as string[]) ?? [],
    coverImageUrl: d.cover_image_url as string | undefined,
    status: d.status as Blog["status"],
    publishedAt: d.published_at as string | undefined,
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function mapExperience(d: Record<string, unknown>): Experience {
  return {
    id: d.id as string,
    roleTitle: d.role_title as string,
    company: d.company as string,
    employmentType: d.employment_type as Experience["employmentType"],
    location: d.location as string | undefined,
    startDate: d.start_date as string,
    endDate: d.end_date as string | undefined,
    isCurrentRole: (d.is_current_role as boolean) ?? false,
    description: d.description as string,
    achievements: (d.achievements as string[]) ?? [],
    technologies: (d.technologies as string[]) ?? [],
    status: d.status as Experience["status"],
    sortOrder: (d.sort_order as number) ?? 0,
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function mapCertificate(d: Record<string, unknown>): Certificate {
  return {
    id: d.id as string,
    certificateName: d.certificate_name as string,
    issuer: d.issuer as string,
    issueDate: d.issue_date as string,
    expirationDate: d.expiration_date as string | undefined,
    credentialId: d.credential_id as string | undefined,
    credentialUrl: d.credential_url as string | undefined,
    category: d.category as Certificate["category"],
    certificateImageUrl: d.certificate_image_url as string | undefined,
    description: d.description as string | undefined,
    status: d.status as Certificate["status"],
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function mapCV(d: Record<string, unknown>): CV {
  return {
    id: d.id as string,
    fileName: d.file_name as string,
    fileUrl: d.file_url as string,
    displayName: d.display_name as string,
    version: d.version as string | undefined,
    isActive: (d.is_active as boolean) ?? false,
    uploadedAt: d.uploaded_at as string,
  };
}
