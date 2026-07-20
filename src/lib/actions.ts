"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

// ──────────────────────────────
// AUTH
// ──────────────────────────────
export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ──────────────────────────────
// PROFILE
// ──────────────────────────────
export async function upsertProfile(formData: FormData) {
  const supabase = await createAdminClient();

  const skillsRaw = (formData.get("skills") as string) || "";
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = {
    full_name: formData.get("fullName") as string,
    professional_title: formData.get("professionalTitle") as string,
    short_bio: formData.get("shortBio") as string,
    long_description: formData.get("longDescription") as string,
    email: formData.get("email") as string,
    location: (formData.get("location") as string) || null,
    linked_in_url: (formData.get("linkedInUrl") as string) || null,
    github_url: (formData.get("githubUrl") as string) || null,
    microsoft_learn_url: (formData.get("microsoftLearnUrl") as string) || null,
    skills,
    updated_at: new Date().toISOString(),
  };

  const id = formData.get("id") as string | null;

  if (id) {
    const { error } = await supabase.from("profile").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("profile").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true };
}

// ──────────────────────────────
// BLOG
// ──────────────────────────────
export async function upsertBlog(formData: FormData) {
  const supabase = await createAdminClient();

  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const status = formData.get("status") as string;
  const publishedAt =
    status === "published"
      ? (formData.get("publishedAt") as string) || new Date().toISOString()
      : null;

  const payload = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    excerpt: formData.get("excerpt") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    tags,
    cover_image_url: (formData.get("coverImageUrl") as string) || null,
    status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  const id = formData.get("id") as string | null;

  if (id) {
    const { error } = await supabase.from("blog").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("blog").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/blog");
  return { success: true };
}

export async function deleteBlog(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("blog").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true };
}

// ──────────────────────────────
// EXPERIENCE
// ──────────────────────────────
export async function upsertExperience(formData: FormData) {
  const supabase = await createAdminClient();

  const achievementsRaw = (formData.get("achievements") as string) || "";
  const technologiesRaw = (formData.get("technologies") as string) || "";

  const achievements = achievementsRaw
    .split("\n")
    .map((a) => a.trim())
    .filter(Boolean);
  const technologies = technologiesRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const isCurrentRole = formData.get("isCurrentRole") === "on";

  const payload = {
    role_title: formData.get("roleTitle") as string,
    company: formData.get("company") as string,
    employment_type: (formData.get("employmentType") as string) || null,
    location: (formData.get("location") as string) || null,
    start_date: formData.get("startDate") as string,
    end_date: isCurrentRole ? null : (formData.get("endDate") as string) || null,
    is_current_role: isCurrentRole,
    description: formData.get("description") as string,
    achievements,
    technologies,
    status: formData.get("status") as string,
    sort_order: parseInt((formData.get("sortOrder") as string) || "0", 10),
    updated_at: new Date().toISOString(),
  };

  const id = formData.get("id") as string | null;

  if (id) {
    const { error } = await supabase.from("experience").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("experience").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/experience");
  return { success: true };
}

export async function deleteExperience(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/experience");
  return { success: true };
}

// ──────────────────────────────
// CERTIFICATE
// ──────────────────────────────
export async function upsertCertificate(formData: FormData) {
  const supabase = await createAdminClient();

  const payload = {
    certificate_name: formData.get("certificateName") as string,
    issuer: formData.get("issuer") as string,
    issue_date: formData.get("issueDate") as string,
    expiration_date: (formData.get("expirationDate") as string) || null,
    credential_id: (formData.get("credentialId") as string) || null,
    credential_url: (formData.get("credentialUrl") as string) || null,
    category: (formData.get("category") as string) || null,
    certificate_image_url: (formData.get("certificateImageUrl") as string) || null,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as string,
    updated_at: new Date().toISOString(),
  };

  const id = formData.get("id") as string | null;

  if (id) {
    const { error } = await supabase.from("certificate").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("certificate").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/certificate");
  return { success: true };
}

export async function deleteCertificate(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("certificate").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/certificate");
  return { success: true };
}

// ──────────────────────────────
// CV
// ──────────────────────────────
export async function uploadCV(formData: FormData) {
  const supabase = await createAdminClient();

  const file = formData.get("cvFile") as File;
  const displayName = formData.get("displayName") as string;
  const version = (formData.get("version") as string) || null;

  if (!file || file.size === 0) return { error: "No file provided." };
  if (!file.name.endsWith(".pdf")) return { error: "Only PDF files are allowed." };
  if (file.size > 5 * 1024 * 1024) return { error: "File size exceeds 5MB." };

  const fileName = `cv_${Date.now()}.pdf`;
  const BUCKET = "cv-files";

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
      return { error: "Storage bucket 'cv-files' not found. Please create it in Supabase Dashboard → Storage → New bucket → name: cv-files → Public: ON" };
    }
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  // Deactivate all previous CVs
  await supabase.from("cv").update({ is_active: false }).eq("is_active", true);

  const { error: insertError } = await supabase.from("cv").insert({
    file_name: fileName,
    file_url: urlData.publicUrl,
    display_name: displayName,
    version,
    is_active: true,
    uploaded_at: new Date().toISOString(),
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/");
  revalidatePath("/admin/cv");
  return { success: true };
}
