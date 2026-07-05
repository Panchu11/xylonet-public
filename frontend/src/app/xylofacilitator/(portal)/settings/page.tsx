"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Webhook, Wallet, Eye, EyeOff, Copy, CheckCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { useXFAuth } from "@/components/xylofacilitator/XFAuthProvider";
import { getWebhooks, createWebhook, deleteWebhook } from "@/lib/xylofacilitator";

const API_BASE = process.env.NEXT_PUBLIC_FACILITATOR_API || 'http://localhost:3001';

export default function SettingsPage() {
  const { developer } = useXFAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#94a3b8] text-sm mt-1">
          Manage your API keys, webhooks, and account settings.
        </p>
      </div>

      {/* API Keys */}
      <ApiKeySection />

      {/* Webhook Config */}
      <WebhookSection />

      {/* Wallet Info */}
      <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={18} className="text-[#01C38E]" />
          <h2 className="text-lg font-semibold text-white">Wallet</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#64748b] font-medium">Connected Wallet</label>
            <div className="mt-1 px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-sm font-mono text-[#01C38E]">
              {developer?.walletAddress || "Not connected"}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#64748b] font-medium">Plan</label>
            <div className="mt-1 px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-sm text-white capitalize">
              {developer?.plan || "free"} Plan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiKeySection() {
  const { token, developer } = useXFAuth();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  // API key from initial registration
  const apiKey = currentKey || developer?.apiKey;
  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${"*".repeat(24)}` : "xyl_****************************";

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (!token || !confirm("Regenerate your API key? The old key will stop working immediately.")) return;
    setRegenerating(true);
    try {
      const res = await fetch(`${API_BASE}/v1/developer/regenerate-key`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { apiKey: newKey } = await res.json();
      setCurrentKey(newKey);
      setRevealed(true);
    } catch (err: any) {
      alert(`Failed to regenerate: ${err.message}`);
    }
    setRegenerating(false);
  };

  return (
    <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Key size={18} className="text-[#01C38E]" />
        <h2 className="text-lg font-semibold text-white">API Key</h2>
      </div>
      <p className="text-sm text-[#64748b] mb-4">
        Use this key in the <code className="text-[#01C38E]">x-api-key</code> header to manage your routes programmatically.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-sm font-mono text-[#94a3b8]">
          {revealed && apiKey ? apiKey : maskedKey}
        </div>
        {apiKey && (
          <>
            <button
              onClick={() => setRevealed(!revealed)}
              className="p-2.5 rounded-lg border border-[#334155] text-[#64748b] hover:text-white hover:border-[#64748b] transition-colors"
              title={revealed ? "Hide" : "Reveal"}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-lg border border-[#334155] text-[#64748b] hover:text-[#01C38E] hover:border-[#01C38E]/30 transition-colors"
              title="Copy"
            >
              {copied ? <CheckCircle size={16} className="text-[#01C38E]" /> : <Copy size={16} />}
            </button>
          </>
        )}
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="p-2.5 rounded-lg border border-[#334155] text-[#64748b] hover:text-orange-400 hover:border-orange-400/30 transition-colors disabled:opacity-50"
          title="Regenerate API key"
        >
          <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />
        </button>
      </div>
      {!apiKey && (
        <p className="text-xs text-[#64748b] mt-3">
          Your API key was shown once at registration. Click the regenerate button to create a new one.
        </p>
      )}
    </div>
  );
}

function WebhookSection() {
  const { token } = useXFAuth();
  const [url, setUrl] = useState("");
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[] }[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWebhooks = useCallback(async () => {
    if (!token) return;
    try {
      const { webhooks: data } = await getWebhooks(token);
      setWebhooks(data || []);
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { loadWebhooks(); }, [loadWebhooks]);

  const handleAdd = async () => {
    if (!url.startsWith("http") || !token) return;
    try {
      const { webhook } = await createWebhook(token, { url, events: ["payment.settled"] });
      setWebhooks(prev => [webhook, ...prev]);
      setUrl("");
      setAdding(false);
    } catch (err: any) {
      alert(`Failed to create webhook: ${err.message}`);
    }
  };

  const handleRemove = async (id: string) => {
    if (!token || !confirm("Delete this webhook?")) return;
    try {
      await deleteWebhook(token, id);
      setWebhooks(prev => prev.filter(w => w.id !== id));
    } catch {}
  };

  return (
    <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Webhook size={18} className="text-[#01C38E]" />
          <h2 className="text-lg font-semibold text-white">Webhooks</h2>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#01C38E]/10 text-[#01C38E] border border-[#01C38E]/20 hover:bg-[#01C38E]/20 transition-colors"
        >
          <Plus size={12} />
          Add Webhook
        </button>
      </div>

      <p className="text-sm text-[#64748b] mb-4">
        Receive real-time notifications when payments are settled to your routes.
      </p>

      {adding && (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="url"
            placeholder="https://your-server.com/webhook"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#0f172a] border border-[#334155] text-white text-sm focus:border-[#01C38E] focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-lg bg-[#01C38E] text-[#0f172a] text-sm font-semibold"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            className="px-4 py-2.5 rounded-lg border border-[#334155] text-[#94a3b8] text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => <div key={i} className="h-12 bg-[#334155]/30 rounded-lg" />)}
        </div>
      ) : webhooks.length > 0 ? (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155]">
              <div>
                <code className="text-sm text-[#94a3b8]">{wh.url}</code>
                <div className="flex gap-2 mt-1">
                  {(wh.events || []).map(e => (
                    <span key={e} className="px-2 py-0.5 rounded text-xs bg-[#01C38E]/10 text-[#01C38E]">{e}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleRemove(wh.id)} className="text-[#64748b] hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-[#64748b] italic">No webhooks configured.</div>
      )}
    </div>
  );
}
