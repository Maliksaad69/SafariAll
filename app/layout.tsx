import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "SafariRequest — Africa's Premier Safari Marketplace",
  description:
    "Compare 10,000+ authentic African safari holidays offered by 100% verified local tour operators across Tanzania, Kenya, South Africa, Uganda, and Botswana. Zero commission. Direct quotes.",
  keywords: ["african safari", "safari bookings", "Tanzania safari", "Kenya safari", "luxury safari", "safari marketplace"],
  icons: {
    icon: [
      { url: '/images/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
    ],
    shortcut: '/images/favicon-32x32.png?v=3',
    apple: '/images/favicon-180x180.png?v=3',
  },
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
    <html lang="en" className={`h-full ${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon-180x180.png?v=3" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
