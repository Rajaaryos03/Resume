"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import type { ReactNode } from "react";

export default function PublicShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
