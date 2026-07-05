import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Globe, DollarSign, Sparkles, Users, TrendingUp, ChevronRight, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary w-[600px] h-[600px] -top-48 -right-48 animate-float" />
        <div className="orb orb-secondary w-[500px] h-[500px] top-1/2 -left-48 animate-float" style={{ animationDelay: '2s' }} />
        <div className="orb orb-accent w-[400px] h-[400px] bottom-0 right-1/4 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="PayX" 
                  width={40} 
                  height={40} 
                  className="rounded-xl shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[rgb(7,7,20)] animate-pulse" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PayX</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="btn-ghost">Features</a>
              <a href="#how-it-works" className="btn-ghost">How it Works</a>
              <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/claim" className="btn-secondary hidden sm:flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Claim Tips</span>
              </Link>
              <Link href="/claim" className="btn-primary flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass rounded-full px-5 py-2.5 mb-8 animate-fade-in-up">
              <span className="status-dot online" />
              <span className="text-sm font-medium text-gray-300">Live on Arc Network</span>
              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">Testnet</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight animate-fade-in-up stagger-1">
              <span className="text-glow">Tip Anyone on</span>
              <br />
              <svg 
                viewBox="0 0 24 24" 
                className="w-[1em] h-[1em] inline-block mt-2" 
                style={{ fill: 'url(#xGradient)' }}
              >
                <defs>
                  <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-2">
              Send <span className="text-white font-semibold">USDC tips</span> instantly to any creator.
              No wallet needed to receive — just sign in with X to claim.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up stagger-3">
              <Link href="/claim" className="btn-primary text-lg px-8 py-4 flex items-center space-x-3 group">
                <Sparkles className="w-5 h-5" />
                <span>Claim Your Tips</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#how-it-works" 
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up stagger-4">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">$0.01</p>
                <p className="text-gray-500 text-sm mt-1">Per Transaction</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-3xl md:text-4xl font-bold gradient-text">&lt;1s</p>
                <p className="text-gray-500 text-sm mt-1">Finality</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text">1%</p>
                <p className="text-gray-500 text-sm mt-1">Platform Fee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-10 w-20 h-20 border border-white/5 rounded-2xl rotate-12 animate-float" />
        <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/5 rounded-xl -rotate-12 animate-float" style={{ animationDelay: '1s' }} />
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-indigo-400 tracking-wider uppercase mb-4 block">Why PayX</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="gradient-text">Creators</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The easiest way to receive tips from your audience on X
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-hover group">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Tips</h3>
              <p className="text-gray-400 leading-relaxed">
                Sub-second finality on Arc Network. Tips arrive in your account instantly, ready to claim anytime.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card card-hover group">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">No Wallet Needed</h3>
              <p className="text-gray-400 leading-relaxed">
                Recipients claim tips with just their X account. Connect a wallet only when you’re ready to withdraw.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card card-hover group">
              <div className="relative w-14 h-14 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Globe className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Lowest Fees</h3>
              <p className="text-gray-400 leading-relaxed">
                Only ~$0.01 per transaction. Tip any amount without high gas fees eating into it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-indigo-400 tracking-wider uppercase mb-4 block">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: Sparkles, title: "Install Extension", desc: "Add PayX to Chrome in one click", color: "from-indigo-500 to-purple-500" },
              { step: "02", icon: Users, title: "Browse X", desc: "See tip buttons on every tweet", color: "from-purple-500 to-pink-500" },
              { step: "03", icon: DollarSign, title: "Send Tip", desc: "Pick an amount and confirm", color: "from-pink-500 to-rose-500" },
              { step: "04", icon: TrendingUp, title: "Creator Claims", desc: "Sign in with X to withdraw", color: "from-rose-500 to-orange-500" },
            ].map((item, index) => (
              <div key={item.step} className="relative group">
                <div className="card card-hover text-center py-10">
                  <span className={`text-5xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent opacity-20 absolute top-4 left-6`}>
                    {item.step}
                  </span>
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-5 w-6 h-6 text-gray-600 -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative card overflow-visible">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl opacity-20 blur-xl" />
            
            <div className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-8 shadow-lg shadow-indigo-500/30">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Start Receiving Tips <span className="gradient-text">Today</span>
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto">
                Check if you have pending tips from your fans and followers
              </p>
              <Link href="/claim" className="btn-primary text-lg px-10 py-4 inline-flex items-center space-x-3">
                <span>Check My Tips</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 border-t border-white/10 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo.png" alt="PayX" width={40} height={40} className="rounded-xl shadow-lg shadow-indigo-500/20" />
                <span className="font-bold text-xl">PayX</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The easiest way to tip creators on X with USDC. Built on Arc Network.
              </p>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-3">
                <Link href="/docs" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Documentation</span>
                </Link>
                <Link href="/docs/quickstart" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Quick Start</span>
                </Link>
                <Link href="/docs/faq" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>FAQ</span>
                </Link>
              </div>
            </div>
            
            {/* Network */}
            <div>
              <h4 className="text-white font-semibold mb-4">Network</h4>
              <div className="space-y-3">
                <a href="https://arc.network" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <img src="/chains/arc.png" alt="Arc" className="w-4 h-4" />
                  <span>Arc Network</span>
                </a>
                <a href="https://testnet.arcscan.app/address/0xA312c384770B7b49E371DF4b7AF730EFEF465913" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Verified Contract</span>
                </a>
                <a href="https://faucet.circle.com" target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <img src="/tokens/usdc.svg" alt="USDC" className="w-4 h-4" />
                  <span>Get Testnet USDC</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              © 2024 PayX. Built for the creator economy.
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm">Built by</span>
              <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">ForgeLabs</span>
              <span className="text-gray-700">•</span>
              <span className="text-gray-600 text-sm">Powered by</span>
              <img src="/chains/arc.png" alt="Arc" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
