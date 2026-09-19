import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafariAsili — Africa's Premier Safari Marketplace",
  description:
    "Compare 10,000+ authentic African safari holidays offered by 100% verified local tour operators across Tanzania, Kenya, South Africa, Uganda, and Botswana. Zero commission. Direct quotes.",
  keywords: ["african safari", "safari bookings", "Tanzania safari", "Kenya safari", "luxury safari", "safari marketplace"],
  openGraph: {
    title: "SafariAsili — Africa's Premier Safari Marketplace",
    description: "Request direct quotes from verified African safari operators.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF7F0] text-[#1C1108] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
