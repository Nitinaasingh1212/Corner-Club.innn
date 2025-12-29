import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/app/components/ClientLayout";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // TODO: Update with production URL
  title: {
    default: "CornerClub - Discover Events, Build Community",
    template: "%s | CornerClub",
  },
  description: "A modern event discovery and management platform. Find local events, connect with people, and build your community.",
  keywords: ["events", "community", "meetups", "local events", "social"],
  openGraph: {
    title: "CornerClub - Discover Events, Build Community",
    description: "Join CornerClub to discover amazing local events and meet new people.",
    url: 'http://localhost:3000',
    siteName: 'CornerClub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CornerClub - Discover Events, Build Community",
    description: "A modern event discovery and management platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
