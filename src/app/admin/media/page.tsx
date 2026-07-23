import type { Metadata } from "next";
import MediaManager from "@/components/admin/MediaManager";

export const metadata: Metadata = { title: "Media Manager" };

export default function MediaPage() {
  return <MediaManager />;
}
