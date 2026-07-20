import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CertificateForm from "@/components/admin/CertificateForm";
import type { Certificate } from "@/types";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("certificate").select("*").eq("id", id).single();
  if (!data) notFound();

  const certificate: Certificate = {
    id: data.id,
    certificateName: data.certificate_name,
    issuer: data.issuer,
    issueDate: data.issue_date,
    expirationDate: data.expiration_date,
    credentialId: data.credential_id,
    credentialUrl: data.credential_url,
    category: data.category,
    certificateImageUrl: data.certificate_image_url,
    description: data.description,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return <CertificateForm certificate={certificate} />;
}
