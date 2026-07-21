import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/db";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();
  return <ProjectForm project={project} />;
}
