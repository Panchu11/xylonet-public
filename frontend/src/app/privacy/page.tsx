import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - XyloNet',
  description: 'XyloNet Privacy Policy - How we handle your data',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Privacy Policy</h1>
        <p className="text-[var(--text-secondary)] mb-4">Last updated: January 15, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Introduction</h2>
            <p className="text-[var(--text-secondary)]">
              XyloNet (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a decentralized exchange and payment platform built on Arc Network. 
              This Privacy Policy explains how we collect, use, and protect your information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Information We Collect</h2>
            <p className="text-[var(--text-secondary)] mb-3">As a decentralized application (dApp), we collect minimal information:</p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li><strong>Wallet Address:</strong> Your public Ethereum wallet address when you connect your wallet</li>
              <li><strong>Transaction Data:</strong> On-chain transaction data that is publicly available on the blockchain</li>
              <li><strong>Usage Data:</strong> Anonymous analytics data to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>To provide and maintain our decentralized exchange services</li>
              <li>To process transactions on the blockchain</li>
              <li>To improve and optimize user experience</li>
              <li>To communicate important updates about our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Data Security</h2>
            <p className="text-[var(--text-secondary)]">
              We implement industry-standard security measures to protect your information. 
              However, please note that blockchain transactions are public and immutable by design.
              We do not store private keys or sensitive wallet information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Third-Party Services</h2>
            <p className="text-[var(--text-secondary)]">
              We may use third-party services such as wallet providers (MetaMask, OKX Wallet, etc.), 
              analytics services, and RPC providers. These services have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Your Rights</h2>
            <p className="text-[var(--text-secondary)]">
              You have the right to disconnect your wallet at any time. 
              On-chain data cannot be deleted due to the immutable nature of blockchain technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Contact Us</h2>
            <p className="text-[var(--text-secondary)]">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:forgelabs@xylonet.xyz" className="text-[var(--accent)] hover:underline">
                forgelabs@xylonet.xyz
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Official Links</h2>
            <p className="text-[var(--text-secondary)]">
              Official website: <a href="https://www.xylonet.xyz" className="text-[var(--accent)] hover:underline">https://www.xylonet.xyz</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
