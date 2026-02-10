import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://espresso.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Espresso - AI Photo Enhancement",
    template: "%s | Espresso"
  },
  description: "Fix your photos with AI. Perfect eye contact, posture, and lighting in seconds.",
  keywords: ["AI photo", "photo enhancement", "portrait fix", "eye contact", "photo editing", "dating app photos", "professional headshots"],
  authors: [{ name: "Espresso Team" }],
  creator: "Espresso Team",
  publisher: "Espresso",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Espresso - Transform Your Photos with AI",
    description: "Fix your photos with AI. Perfect eye contact, posture, and lighting in seconds.",
    url: baseUrl,
    siteName: "Espresso",
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image to public/
        width: 1200,
        height: 630,
        alt: "Espresso AI Photo Enhancement",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Espresso - AI Photo Enhancement",
    description: "Fix your photos with AI. Perfect eye contact, posture, and lighting in seconds.",
    images: ['/og-image.jpg'], // Same image reference
    creator: "@espresso_app", // Placeholder
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: baseUrl,
  },
};

import { JsonLd } from "@/components/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
        >
          <JsonLd />
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
