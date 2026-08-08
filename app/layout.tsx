import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "KalaVisual Management",
    template: "%s | KalaVisual"
  },
  description:
    "Photographer job, contact, reminder, and finance management. Stay ahead of shoots, clients, and profitability.",
  openGraph: {
    title: "KalaVisual Management",
    description:
      "A photographer workspace built for schedule clarity and job profit. Manage freelance photography operations from inquiry to payment closeout.",
    siteName: "KalaVisual",
    type: "website",
    locale: "id_ID"
  },
  icons: {
    icon: "/favicon.svg"
  }
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={inter.variable} lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
