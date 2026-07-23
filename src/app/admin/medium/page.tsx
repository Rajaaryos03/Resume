import type { Metadata } from "next";
import MediumImporter from "@/components/admin/MediumImporter";

export const metadata: Metadata = { title: "Import from Medium" };

export default function MediumPage() {
  return <MediumImporter />;
}
