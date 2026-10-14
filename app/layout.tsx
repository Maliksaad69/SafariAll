import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { buildOrganizationSchema } from '@/lib/seo';

const bodyFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "SafariRequest — Africa's Premier Safari Marketplace",
  description:
    "Compare 10,000+ authentic African safari holidays offered by 100% verified local tour operators across Tanzania, Kenya, South Africa, Uganda, and Botswana. Zero commission. Direct quotes.",
  keywords: ["african safari", "safari bookings", "Tanzania safari", "Kenya safari", "luxury safari", "safari marketplace"],
  openGraph: {
    title: "SafariRequest — Africa's Premier Safari Marketplace",
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
    <html lang="en" className={`h-full ${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
