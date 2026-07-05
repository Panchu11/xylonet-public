"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  LayoutDashboard, Route, Settings, FileText, LogOut, Zap, ExternalLink,
} from "lucide-react";
import { XFAuthProvider, useXFAuth } from "@/components/xylofacilitator/XFAuthProvider";

// Sidebar Navigation
const NAV_ITEMS = [
  { href: "/xylofacilitator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/xylofacilitator/routes", label: "Routes", icon: Route },
  { href: "/xylofacilitator/settings", label: "Settings", icon: Settings },
  { href: "/xylofacilitator/docs", label: "Docs", icon: FileText },
];

function Sidebar() {
  const pathname = usePathname();
  const { developer, signOut } = useXFAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#1e293b]/50 border-r border-[#334155]/50 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#334155]/50">
        <Link href="/xylofacilitator" className="flex items-center gap-2">
          <Zap size={20} className="text-[#01C38E]" />
          <span className="text-lg font-bold bg-gradient-to-r from-[#0A786A] to-[#01C38E] bg-clip-text text-transparent">
            XyloFacilitator
          </span>
        </Link>
        <div className="mt-2 text-xs text-[#64748b]">Developer Portal</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#01C38E]/10 text-[#01C38E] border border-[#01C38E]/20"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#334155]/30"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#334155]/50 space-y-3">
        <a
          href="https://testnet.arcscan.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-xs text-[#64748b] hover:text-[#01C38E] transition-colors"
        >
          <ExternalLink size={12} />
          Arc Testnet Explorer
        </a>
        {developer && (
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-xs text-[#64748b] hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}

// Sign In Screen
function SignInScreen() {
  const { isConnected } = useAccount();
  const { signIn, loading } = useXFAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#01C38E]/10 border border-[#01C38E]/20 text-[#01C38E] text-sm font-medium mb-4">
            <Zap size={14} />
            Developer Portal
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to XyloFacilitator</h1>
          <p className="text-[#94a3b8]">
            Connect your wallet and sign in to manage your x402 API routes.
          </p>
        </div>

        <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl p-8 space-y-6">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-[#94a3b8]">Step 1: Connect your wallet</p>
              <ConnectButton />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-[#94a3b8]">Step 2: Sign in with your wallet</p>
              <ConnectButton />
              <button
                onClick={signIn}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] hover:shadow-[0_0_20px_rgba(1,195,142,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In with Ethereum"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Layout Component
export default function XyloFacilitatorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <XFAuthProvider>
      <PortalContent>{children}</PortalContent>
    </XFAuthProvider>
  );
}

function PortalContent({ children }: { children: React.ReactNode }) {
  const { token, loading } = useXFAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-pulse text-[#01C38E]">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return <SignInScreen />;
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
