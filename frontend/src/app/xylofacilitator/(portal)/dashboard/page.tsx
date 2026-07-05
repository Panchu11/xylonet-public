"use client";

import { useState, useEffect } from "react";
import { DollarSign, Activity, Route, TrendingUp, ExternalLink } from "lucide-react";
import { useXFAuth } from "@/components/xylofacilitator/XFAuthProvider";
import { getAnalytics, getRoutes, type DeveloperAnalytics, type ApiRoute } from "@/lib/xylofacilitator";

export default function DashboardPage() {
  const { token, developer } = useXFAuth();
  const [analytics, setAnalytics] = useState<DeveloperAnalytics | null>(null);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getAnalytics(token).catch(() => ({ analytics: null })),
      getRoutes(token).catch(() => ({ routes: [] })),
    ]).then(([analyticsRes, routesRes]) => {
      setAnalytics(analyticsRes.analytics);
      setRoutes(routesRes.routes || []);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-xl p-6 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = parseFloat(analytics?.totalVolumeUSD || "0");
  const totalCalls = analytics?.totalCalls || 0;
  const activeRoutes = routes.filter(r => r.is_active).length;
  const avgPayment = totalCalls > 0 ? (totalRevenue / totalCalls).toFixed(4) : "0.00";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#94a3b8] text-sm mt-1">
          Welcome back{developer?.name ? `, ${developer.name}` : ""}. Here&apos;s your x402 payment overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          sub="USDC earned"
          icon={DollarSign}
          color="#01C38E"
        />
        <StatCard
          label="API Calls"
          value={totalCalls.toString()}
          sub="paid requests"
          icon={Activity}
          color="#6BCCFF"
        />
        <StatCard
          label="Active Routes"
          value={activeRoutes.toString()}
          sub={`of ${routes.length} total`}
          icon={Route}
          color="#01C38E"
        />
        <StatCard
          label="Avg Payment"
          value={`$${avgPayment}`}
          sub="per call"
          icon={TrendingUp}
          color="#0A786A"
        />
      </div>

      {/* Recent Settlements */}
      <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#334155]/50">
          <h2 className="text-lg font-semibold text-white">Recent Settlements</h2>
        </div>
        <div className="overflow-x-auto">
          {analytics?.recentSettlements && analytics.recentSettlements.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#64748b] uppercase tracking-wider border-b border-[#334155]/30">
                  <th className="px-6 py-3 text-left">Tx Hash</th>
                  <th className="px-6 py-3 text-left">From</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Fee</th>
                  <th className="px-6 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentSettlements.slice(0, 10).map((s) => (
                  <tr key={s.id} className="border-b border-[#334155]/20 hover:bg-[#334155]/10">
                    <td className="px-6 py-3">
                      <a
                        href={`https://testnet.arcscan.app/tx/${s.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-[#01C38E] hover:underline flex items-center gap-1"
                      >
                        {s.tx_hash.slice(0, 10)}...
                        <ExternalLink size={10} />
                      </a>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#94a3b8] font-mono">
                      {s.from_address.slice(0, 6)}...{s.from_address.slice(-4)}
                    </td>
                    <td className="px-6 py-3 text-sm text-white text-right font-medium">
                      ${Number(s.amount_usd).toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#64748b] text-right">
                      ${Number(s.fee_usd).toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#64748b] text-right">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-[#64748b]">
              <Activity size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No settlements yet. Create an API route to start receiving payments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string; icon: any; color: string;
}) {
  return (
    <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-xl p-6 hover:border-[#01C38E]/20 transition-all">
      <Icon size={18} style={{ color }} className="mb-3" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-[#64748b] mt-1">{sub}</div>
      <div className="text-xs text-[#94a3b8] font-medium mt-0.5">{label}</div>
    </div>
  );
}
