import type { Metadata } from 'next';
import Script from 'next/script';
import './payx.css';

export const metadata: Metadata = {
  title: 'PayX - Tip Anyone on X | XyloNet',
  description: 'Send and receive USDC tips on X/Twitter powered by Arc Network. A secure, decentralized tipping platform built on blockchain technology.',
  keywords: ['tipping', 'X', 'Twitter', 'USDC', 'Arc Network', 'crypto', 'PayX', 'XyloNet', 'DeFi', 'blockchain'],
  authors: [{ name: 'ForgeLabs', url: 'https://xylonet.xyz' }],
  creator: 'ForgeLabs',
  publisher: 'XyloNet',
  robots: 'index, follow',
  openGraph: {
    title: 'PayX - Tip Anyone on X | XyloNet',
    description: 'Send and receive USDC tips on X/Twitter. Secure, decentralized tipping on Arc Network.',
    url: 'https://xylonet.xyz/payx',
    siteName: 'XyloNet',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'PayX - Tip Anyone on X',
    description: 'Send and receive USDC tips on X/Twitter. Secure tipping on Arc Network.',
    creator: '@Xylonet_',
    site: '@Xylonet_',
  },
  verification: {
    google: 'googleacc01605102cb694',
  },
  alternates: {
    canonical: 'https://xylonet.xyz/payx',
  },
};

// JSON-LD Structured Data for trust signals
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PayX by XyloNet',
  description: 'Send and receive USDC tips on X/Twitter powered by Arc Network',
  url: 'https://xylonet.xyz/payx',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'ForgeLabs',
    url: 'https://xylonet.xyz',
  },
  provider: {
    '@type': 'Organization',
    name: 'XyloNet',
    url: 'https://xylonet.xyz',
  },
};

export default function PayXLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="payx-page min-h-screen">
      <Script
        id="payx-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </div>
  );
}
