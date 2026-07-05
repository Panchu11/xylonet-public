"use client";

import { useState } from "react";
import { Copy, CheckCircle, FileText, Code, Zap, Globe, Bot } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_FACILITATOR_API || 'https://api.xylonet.xyz';

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Documentation</h1>
        <p className="text-[#94a3b8] text-sm mt-1">
          Everything you need to integrate XyloFacilitator into your APIs.
        </p>
      </div>

      {/* Quick Start */}
      <Section title="Quick Start" icon={Zap}>
        <p className="text-sm text-[#94a3b8] mb-4">
          Get your API monetized in 3 steps. No SDK required on the buyer (AI agent) side.
        </p>

        <CodeBlock
          id="step1"
          title="1. Register (via SIWE or API)"
          code={`# Connect your wallet on the portal, or register via API:
curl -X POST ${API_BASE}/v1/developer/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "dev@example.com",
    "walletAddress": "0xYourWalletAddress"
  }'
# Returns: { apiKey: "xyl_..." }`}
          onCopy={handleCopy}
          copied={copied}
        />

        <CodeBlock
          id="step2"
          title="2. Create a priced route"
          code={`curl -X POST ${API_BASE}/v1/developer/routes \\
  -H "x-api-key: xyl_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "routePath": "weather",
    "targetUrl": "https://api.yourservice.com/weather",
    "priceUsd": 0.01,
    "method": "GET",
    "description": "Current weather data"
  }'`}
          onCopy={handleCopy}
          copied={copied}
        />

        <CodeBlock
          id="step3"
          title="3. AI agents pay automatically"
          code={`# Agent requests your route - gets 402 with payment requirements:
curl ${API_BASE}/v1/proxy/weather?city=NYC
# Response: 402 { acceptances: [{ amount: "10000", asset: "USDC", ... }] }

# Agent signs EIP-3009 payment and retries:
curl ${API_BASE}/v1/proxy/weather?city=NYC \\
  -H "x-payment: x402 <base64-eip3009-authorization>"
# Response: 200 (your API response) + X-Payment-Receipt header`}
          onCopy={handleCopy}
          copied={copied}
        />
      </Section>

      {/* x402 Protocol */}
      <Section title="x402 Payment Flow" icon={Globe}>
        <div className="space-y-4 text-sm text-[#94a3b8]">
          <p>The x402 protocol enables HTTP-native payments:</p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>AI agent sends request to your route via <code className="text-[#01C38E]">/v1/proxy/your-route</code></li>
            <li>If no payment header: server returns <code className="text-[#01C38E]">HTTP 402</code> with payment requirements (amount, asset, recipient)</li>
            <li>Agent signs an EIP-3009 <code className="text-[#01C38E]">transferWithAuthorization</code> for USDC</li>
            <li>Agent retries with <code className="text-[#01C38E]">x-payment: x402 &lt;base64&gt;</code> header</li>
            <li>XyloFacilitator settles the USDC payment on Arc (sub-second)</li>
            <li>Request is forwarded to your target URL</li>
            <li>Response returned to agent with payment receipt</li>
          </ol>
          <p className="mt-4">
            <strong className="text-white">Key:</strong> The agent never needs an SDK. Any HTTP client that supports
            the x402 protocol can pay. The payment is gasless for the agent (EIP-3009).
          </p>
        </div>
      </Section>

      {/* API Reference */}
      <Section title="API Reference" icon={Code}>
        <div className="space-y-3">
          {[
            { method: "POST", path: "/v1/auth/siwe/challenge", desc: "Get SIWE sign-in challenge" },
            { method: "POST", path: "/v1/auth/siwe/verify", desc: "Verify signature, get auth token" },
            { method: "GET", path: "/v1/auth/session", desc: "Get current session (Bearer token)" },
            { method: "POST", path: "/v1/developer/register", desc: "Register developer (email + wallet)" },
            { method: "GET", path: "/v1/developer/me", desc: "Get developer profile" },
            { method: "POST", path: "/v1/developer/routes", desc: "Create priced API route" },
            { method: "GET", path: "/v1/developer/routes", desc: "List your routes" },
            { method: "GET", path: "/v1/developer/analytics", desc: "Get payment analytics" },
            { method: "GET", path: "/v1/facilitator/status", desc: "Facilitator contract status" },
            { method: "POST", path: "/v1/facilitator/settle", desc: "Settle EIP-3009 payment" },
            { method: "ALL", path: "/v1/proxy/*", desc: "x402 payment proxy (agents call this)" },
          ].map((ep, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155]/50">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                ep.method === "GET" ? "bg-blue-500/20 text-blue-400" :
                ep.method === "POST" ? "bg-green-500/20 text-green-400" :
                "bg-purple-500/20 text-purple-400"
              }`}>
                {ep.method}
              </span>
              <code className="text-sm font-mono text-[#94a3b8] flex-1">{ep.path}</code>
              <span className="text-xs text-[#64748b]">{ep.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Webhook Docs */}
      <Section title="Webhooks" icon={FileText}>
        <p className="text-sm text-[#94a3b8] mb-4">
          Configure webhooks in Settings to receive real-time notifications.
          All webhooks are signed with HMAC-SHA256.
        </p>
        <CodeBlock
          id="webhook-payload"
          title="Webhook payload format"
          code={`POST https://your-server.com/webhook
Headers:
  Content-Type: application/json
  X-XyloFacilitator-Signature: sha256=<hmac_hex>
  X-XyloFacilitator-Event: payment.settled

Body:
{
  "event": "payment.settled",
  "timestamp": "2026-05-27T12:00:00.000Z",
  "data": {
    "tx_hash": "0xabc...",
    "from_address": "0x...",
    "to_address": "0x...",
    "amount_usd": 0.01,
    "fee_usd": 0.0001,
    "route_path": "weather"
  }
}`}
          onCopy={handleCopy}
          copied={copied}
        />
        <p className="text-xs text-[#64748b] mt-3">
          Verify the signature by computing <code className="text-[#01C38E]">HMAC-SHA256(webhook_secret, body)</code> and comparing to the header value.
        </p>
      </Section>

      {/* Agent Integration */}
      <Section title="AI Agent Integration" icon={Bot}>
        <p className="text-sm text-[#94a3b8] mb-4">
          Reference implementation for AI agents handling x402 payments.
          Works with any EIP-3009 compatible USDC wallet.
        </p>
        <CodeBlock
          id="agent-js"
          title="JavaScript/TypeScript (viem)"
          code={`import { encodePacked, keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const FACILITATOR = '${API_BASE}';
const account = privateKeyToAccount('0xYOUR_AGENT_KEY');

async function callPaidApi(routePath, params = {}) {
  const url = new URL(\`\${FACILITATOR}/v1/proxy/\${routePath}\`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  // 1. Request — returns 402 with payment requirements
  const res = await fetch(url);
  if (res.status !== 402) return res.json();

  const { acceptances } = await res.json();
  const req = acceptances[0];

  // 2. Sign EIP-3009 transferWithAuthorization
  const nonce = keccak256(encodePacked(['uint256'], [BigInt(Date.now())]));
  const validBefore = BigInt(Math.floor(Date.now() / 1000) + 300);

  const signature = await account.signTypedData({
    domain: {
      name: 'USDC', version: '2',
      chainId: 5042002,
      verifyingContract: req.asset,
    },
    types: {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    },
    primaryType: 'TransferWithAuthorization',
    message: {
      from: account.address, to: req.recipient,
      value: BigInt(req.amount),
      validAfter: 0n, validBefore, nonce,
    },
  });

  // 3. Retry with x-payment header
  const payment = btoa(JSON.stringify({
    from: account.address, to: req.recipient,
    value: req.amount, validAfter: '0',
    validBefore: validBefore.toString(),
    nonce, signature,
  }));

  return (await fetch(url, {
    headers: { 'x-payment': \`x402 \${payment}\` }
  })).json();
}

// Usage:
const weather = await callPaidApi('weather', { city: 'NYC' });`}
          onCopy={handleCopy}
          copied={copied}
        />
        <CodeBlock
          id="agent-python"
          title="Python (eth_account)"
          code={`import requests, json, time, base64, os
from eth_account import Account
from eth_account.messages import encode_typed_data

API = "${API_BASE}"
agent = Account.from_key(os.environ["AGENT_PRIVATE_KEY"])

def call_paid_api(route_path, params=None):
    url = f"{API}/v1/proxy/{route_path}"
    res = requests.get(url, params=params)
    if res.status_code != 402:
        return res.json()

    req = res.json()["acceptances"][0]
    nonce = "0x" + os.urandom(32).hex()
    valid_before = str(int(time.time()) + 300)

    sig = agent.sign_typed_data(full_message={
        "types": {
            "EIP712Domain": [
                {"name": "name", "type": "string"},
                {"name": "version", "type": "string"},
                {"name": "chainId", "type": "uint256"},
                {"name": "verifyingContract", "type": "address"},
            ],
            "TransferWithAuthorization": [
                {"name": "from", "type": "address"},
                {"name": "to", "type": "address"},
                {"name": "value", "type": "uint256"},
                {"name": "validAfter", "type": "uint256"},
                {"name": "validBefore", "type": "uint256"},
                {"name": "nonce", "type": "bytes32"},
            ],
        },
        "primaryType": "TransferWithAuthorization",
        "domain": {
            "name": "USDC", "version": "2",
            "chainId": 5042002,
            "verifyingContract": req["asset"],
        },
        "message": {
            "from": agent.address, "to": req["recipient"],
            "value": int(req["amount"]),
            "validAfter": 0,
            "validBefore": int(valid_before),
            "nonce": nonce,
        },
    })

    payment = base64.b64encode(json.dumps({
        "from": agent.address, "to": req["recipient"],
        "value": req["amount"], "validAfter": "0",
        "validBefore": valid_before, "nonce": nonce,
        "signature": sig.signature.hex(),
    }).encode()).decode()

    return requests.get(url, params=params,
        headers={"x-payment": f"x402 {payment}"}).json()

# Usage:
weather = call_paid_api("weather", {"city": "NYC"})`}
          onCopy={handleCopy}
          copied={copied}
        />
      </Section>

      {/* Contract Addresses */}
      <Section title="Contract Addresses" icon={Code}>
        <div className="space-y-2">
          {[
            { label: "XyloFacilitator", address: "0x7A97181936bA95e092E3e76223a0dab0Db97f17d" },
            { label: "USDC (Arc)", address: "0x3600000000000000000000000000000000000000" },
            { label: "Chain ID", address: "5042002 (Arc Testnet)" },
            { label: "RPC", address: "https://rpc.testnet.arc.network" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155]/50">
              <span className="text-xs text-[#64748b] font-medium">{item.label}</span>
              <code className="text-xs text-[#01C38E] font-mono">{item.address}</code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-[#1e293b]/60 border border-[#334155]/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon size={18} className="text-[#01C38E]" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ id, title, code, onCopy, copied }: {
  id: string; title: string; code: string; onCopy: (text: string, id: string) => void; copied: string | null;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#01C38E] font-mono">{title}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="p-1 rounded hover:bg-[#334155]/50 transition-colors"
        >
          {copied === id ? (
            <CheckCircle size={12} className="text-[#01C38E]" />
          ) : (
            <Copy size={12} className="text-[#64748b]" />
          )}
        </button>
      </div>
      <pre className="bg-[#0f172a] rounded-xl p-4 text-xs font-mono text-[#94a3b8] overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}
