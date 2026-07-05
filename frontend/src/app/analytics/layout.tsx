import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | XyloNet',
  description: 'Real-time protocol analytics for XyloNet — TVL, volume, bridge metrics, and more.',
  openGraph: {
    title: 'XyloNet Analytics',
    description: 'Live protocol metrics and volume data for XyloNet on Arc Network.',
  },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
