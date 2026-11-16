import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { buildOrganizationSchema } from '@/lib/seo';

const bodyFont = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const displayFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "SafariHello — Africa's Marketplace for Safari Tours",
  description:
    "Explore African safari tours, compare itineraries, and request quotes directly from local tour operators on SafariHello.",
  keywords: ["african safari", "safari tours", "safari marketplace", "Tanzania safari", "Kenya safari", "safari quotes", "local tour operators", "SafariHello"],
  icons: {
    icon: [
      { url: '/images/favicon-32x32.png?v=7', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png?v=7', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-192x192.png?v=7', sizes: '192x192', type: 'image/png' },
      { url: '/images/favicon-512x512.png?v=7', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico?v=7', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=7',
    apple: '/images/favicon-180x180.png?v=7',
  },
  openGraph: {
    title: "SafariHello — Africa's Marketplace for Safari Tours",
    description: "Explore African safari tours, compare itineraries, and request quotes directly from local tour operators on SafariHello.",
    type: "website",
    siteName: "SafariHello",
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
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png?v=7" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png?v=7" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192x192.png?v=7" />
        <link rel="shortcut icon" href="/favicon.ico?v=7" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon-180x180.png?v=7" />
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
