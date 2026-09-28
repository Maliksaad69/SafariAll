import type { Metadata } from "next";
import "./globals.css";
import { buildOrganizationSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: "SafariBuilt — Africa's Premier Safari Marketplace",
  description:
    "Compare 10,000+ authentic African safari holidays offered by 100% verified local tour operators across Tanzania, Kenya, South Africa, Uganda, and Botswana. Zero commission. Direct quotes.",
  keywords: ["african safari", "safaribuilt", "Tanzania safari", "Kenya safari", "luxury safari", "safari marketplace"],
  openGraph: {
    title: "SafariBuilt — Africa's Premier Safari Marketplace",
    description: "Request direct quotes from verified African safari operators.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = buildOrganizationSchema();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)] font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
