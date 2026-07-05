import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - XyloNet',
  description: 'XyloNet Terms of Service - Rules and guidelines for using our platform',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8">Terms of Service</h1>
        <p className="text-[var(--text-secondary)] mb-4">Last updated: January 15, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">1. Acceptance of Terms</h2>
            <p className="text-[var(--text-secondary)]">
              By accessing or using XyloNet (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">2. Description of Service</h2>
            <p className="text-[var(--text-secondary)]">
              XyloNet is a decentralized exchange (DEX) and payment platform built on Arc Network. 
              Our services include token swapping, liquidity provision, yield vaults, and the PayX payment system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">3. Eligibility</h2>
            <p className="text-[var(--text-secondary)]">
              You must be at least 18 years old and legally able to enter into contracts to use our services. 
              You are responsible for ensuring that your use of the Platform complies with applicable laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">4. Wallet Connection</h2>
            <p className="text-[var(--text-secondary)]">
              To use our services, you must connect a compatible cryptocurrency wallet. 
              You are solely responsible for the security of your wallet and private keys. 
              We never have access to your private keys or seed phrases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">5. Risks</h2>
            <p className="text-[var(--text-secondary)] mb-3">
              Using decentralized finance (DeFi) protocols involves significant risks:
            </p>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Smart contract risks and potential vulnerabilities</li>
              <li>Price volatility of digital assets</li>
              <li>Impermanent loss in liquidity pools</li>
              <li>Network congestion and transaction failures</li>
              <li>Regulatory uncertainty</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">6. No Financial Advice</h2>
            <p className="text-[var(--text-secondary)]">
              Nothing on this Platform constitutes financial, investment, legal, or tax advice. 
              You should consult with qualified professionals before making any financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">7. Limitation of Liability</h2>
            <p className="text-[var(--text-secondary)]">
              XyloNet is provided &quot;as is&quot; without warranties of any kind. 
              We are not liable for any losses resulting from your use of the Platform, 
              including but not limited to trading losses, smart contract failures, or wallet compromises.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">8. Prohibited Activities</h2>
            <ul className="list-disc pl-6 text-[var(--text-secondary)] space-y-2">
              <li>Using the Platform for illegal activities</li>
              <li>Attempting to exploit or manipulate smart contracts</li>
              <li>Interfering with the Platform&apos;s operation</li>
              <li>Impersonating other users or entities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">9. Changes to Terms</h2>
            <p className="text-[var(--text-secondary)]">
              We may update these Terms at any time. Continued use of the Platform after changes 
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">10. Contact</h2>
            <p className="text-[var(--text-secondary)]">
              For questions about these Terms, contact us at{' '}
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
