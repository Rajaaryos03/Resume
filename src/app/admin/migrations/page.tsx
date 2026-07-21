import type { Metadata } from "next";
import MigrationsClient from "@/components/admin/MigrationsClient";

export const metadata: Metadata = { title: "Database Migrations" };

export default function AdminMigrationsPage() {
  return <MigrationsClient />;
}
