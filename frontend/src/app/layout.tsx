import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalFooter from "@/components/ConditionalFooter";

const satoshi = Manrope({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: 'swap',
  preload: true,
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "XyloNet - Stablecoin SuperExchange on Arc",
  description: "The premier DEX + Bridge on Arc Network. Instant settlement, predictable fees, and native cross-chain transfers powered by Circle CCTP.",
  keywords: ["DEX", "Bridge", "Arc Network", "Stablecoin", "USDC", "EURC", "DeFi", "cryptocurrency", "decentralized exchange"],
  manifest: '/manifest.json',
  icons: {
    icon: '/branding/xylonet-mint.svg',
    shortcut: '/branding/xylonet-mint.svg',
    apple: '/branding/xylonet-mint.svg',
  },
  authors: [{ name: 'ForgeLabs', url: 'https://xylonet.xyz' }],
  creator: 'ForgeLabs',
  publisher: 'XyloNet',
  robots: 'index, follow',
  openGraph: {
    title: 'XyloNet - Stablecoin SuperExchange on Arc',
    description: 'The premier DEX + Bridge on Arc Network. Swap, Bridge, and Earn with USDC, EURC, and USYC.',
    url: 'https://xylonet.xyz',
    siteName: 'XyloNet',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'XyloNet - Stablecoin SuperExchange on Arc',
    description: 'The premier DEX + Bridge on Arc Network.',
    creator: '@Xylonet_',
    site: '@Xylonet_',
  },
  verification: {
    google: 'googleacc01605102cb694',
  },
  alternates: {
    canonical: 'https://xylonet.xyz',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#01C38E',
};

// Organization JSON-LD for trust signals
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'XyloNet',
  alternateName: 'ForgeLabs',
  url: 'https://www.xylonet.xyz',
  logo: 'https://www.xylonet.xyz/branding/xylonet-wordmark.svg',
  description: 'Stablecoin SuperExchange on Arc Network - DEX, Bridge, and PayX payment platform',
  foundingDate: '2024',
  sameAs: [
    'https://x.com/Xylonet_',
    'https://discord.gg/mcDkHNrFyA',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'forgelabs@xylonet.xyz',
    contactType: 'customer support',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${satoshi.variable} font-sans antialiased bg-[var(--background)] text-[var(--text-primary)] min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
