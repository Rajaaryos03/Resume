import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Raja Aryos — Power Platform Developer",
    template: "%s | Raja Aryos",
  },
  description:
    "Power Platform Developer focused on building business solutions with Power Apps, Power Automate, Dataverse, SharePoint, and Microsoft Copilot Studio.",
  keywords: [
    "Power Platform",
    "Power Apps",
    "Power Automate",
    "Dataverse",
    "Copilot Studio",
    "Microsoft 365",
    "Portfolio",
  ],
  authors: [{ name: "Raja Aryos" }],
  creator: "Raja Aryos",
  metadataBase: new URL("https://rajaaryos.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rajaaryos.dev",
    siteName: "Raja Aryos Portfolio",
    title: "Raja Aryos — Power Platform Developer",
    description:
      "Power Platform Developer focused on building business solutions with Power Apps, Power Automate, Dataverse, SharePoint, and Microsoft Copilot Studio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raja Aryos — Power Platform Developer",
    description:
      "Power Platform Developer focused on building business solutions with Power Apps, Power Automate, Dataverse, SharePoint, and Microsoft Copilot Studio.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
        <PublicShell footer={<Footer />}>{children}</PublicShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1E293B",
              color: "#F8FAFC",
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
