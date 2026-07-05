"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Copy, CheckCircle, Trash2, ExternalLink, Globe } from "lucide-react";
import { useXFAuth } from "@/components/xylofacilitator/XFAuthProvider";
import { getRoutes, createRoute, deleteRoute, type ApiRoute, type CreateRouteInput } from "@/lib/xylofacilitator";

const API_BASE = process.env.NEXT_PUBLIC_FACILITATOR_API || 'http://localhost:3001';

export default function RoutesPage() {
  const { token } = useXFAuth();
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    if (!token) return;
    try {
      const { routes: data } = await getRoutes(token);
      setRoutes(data || []);
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { loadRoutes(); }, [loadRoutes]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (routeId: string) => {
    if (!token || !confirm("Delete this route? AI agents will no longer be able to pay for it.")) return;
    try {
      await deleteRoute(token, routeId);
      setRoutes(prev => prev.filter(r => r.id !== routeId));
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Routes</h1>
          <p className="text-[#94a3b8] text-sm mt-1">
            Configure priced endpoints. AI agents pay via x402 to access them.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#01C38E] text-[#0f172a] font-semibold text-sm hover:bg-[#01C38E]/90 transition-all"
        >
          <Plus size={16} />
          New Route
        </button>
      </div>

      {/* New Route Form */}
      {showNew && (
        <NewRouteForm
          token={token!}
          onCreated={(route) => { setRoutes(prev => [route, ...prev]); setShowNew(false); }}
          onCancel={() => setShowNew(false)}
        />
      )}

      {/* Routes Table */}
      <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-[#334155]/30 rounded-lg" />)}
          </div>
        ) : routes.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">
            <Globe size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No routes yet. Create one to start receiving payments from AI agents.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#64748b] uppercase tracking-wider border-b border-[#334155]/30">
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">Target</th>
                  <th className="px-6 py-3 text-center">Method</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Calls</th>
                  <th className="px-6 py-3 text-right">Revenue</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => {
                  const x402Url = `${API_BASE}/v1/proxy/${route.route_path}`;
                  return (
                    <tr key={route.id} className="border-b border-[#334155]/20 hover:bg-[#334155]/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-[#01C38E]">/{route.route_path}</code>
                          <button
                            onClick={() => handleCopy(x402Url, route.id)}
                            className="p-1 rounded hover:bg-[#334155]/50"
                            title="Copy x402 endpoint URL"
                          >
                            {copied === route.id ? (
                              <CheckCircle size={12} className="text-[#01C38E]" />
                            ) : (
                              <Copy size={12} className="text-[#64748b]" />
                            )}
                          </button>
                        </div>
                        {route.description && (
                          <p className="text-xs text-[#64748b] mt-1">{route.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94a3b8] max-w-[200px] truncate">
                        {route.target_url}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400">
                          {route.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white text-right font-medium">
                        ${route.price_usd}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#94a3b8] text-right">
                        {route.total_calls || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#01C38E] text-right font-medium">
                        ${(route.total_revenue_usd || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-[#64748b] hover:text-red-400 transition-colors"
                          title="Delete route"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function NewRouteForm({ token, onCreated, onCancel }: {
  token: string;
  onCreated: (route: ApiRoute) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CreateRouteInput>({
    routePath: "",
    targetUrl: "",
    method: "GET",
    priceUsd: 0.01,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { route } = await createRoute(token, form);
      onCreated(route);
    } catch (err: any) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1e293b]/60 border border-[#01C38E]/20 rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">New API Route</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#94a3b8] font-medium">Route Path</label>
          <input
            type="text"
            placeholder="weather"
            value={form.routePath}
            onChange={(e) => setForm(prev => ({ ...prev, routePath: e.target.value }))}
            className="mt-1 w-full px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm focus:border-[#01C38E] focus:outline-none"
            required
          />
          <p className="text-xs text-[#64748b] mt-1">Agents access: /v1/proxy/{form.routePath || "..."}</p>
        </div>

        <div>
          <label className="text-xs text-[#94a3b8] font-medium">Target URL</label>
          <input
            type="url"
            placeholder="https://api.example.com/weather"
            value={form.targetUrl}
            onChange={(e) => setForm(prev => ({ ...prev, targetUrl: e.target.value }))}
            className="mt-1 w-full px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm focus:border-[#01C38E] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs text-[#94a3b8] font-medium">Method</label>
          <select
            value={form.method}
            onChange={(e) => setForm(prev => ({ ...prev, method: e.target.value }))}
            className="mt-1 w-full px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm focus:border-[#01C38E] focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-[#94a3b8] font-medium">Price (USDC)</label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={form.priceUsd}
            onChange={(e) => setForm(prev => ({ ...prev, priceUsd: parseFloat(e.target.value) }))}
            className="mt-1 w-full px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm focus:border-[#01C38E] focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-[#94a3b8] font-medium">Description (optional)</label>
          <input
            type="text"
            placeholder="Get current weather data for any city"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 w-full px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm focus:border-[#01C38E] focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-[#01C38E] text-[#0f172a] font-semibold text-sm hover:bg-[#01C38E]/90 transition-all disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Route"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-[#334155] text-[#94a3b8] text-sm hover:text-white hover:border-[#64748b] transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
