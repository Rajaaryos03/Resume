import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExperienceForm from "@/components/admin/ExperienceForm";
import type { Experience } from "@/types";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("experience").select("*").eq("id", id).single();
  if (!data) notFound();

  const experience: Experience = {
    id: data.id,
    roleTitle: data.role_title,
    company: data.company,
    employmentType: data.employment_type,
    location: data.location,
    startDate: data.start_date,
    endDate: data.end_date,
    isCurrentRole: data.is_current_role,
    description: data.description,
    achievements: data.achievements ?? [],
    technologies: data.technologies ?? [],
    status: data.status,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return <ExperienceForm experience={experience} />;
}
