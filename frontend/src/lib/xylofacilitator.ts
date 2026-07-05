/**
 * XyloFacilitator API Client
 * Typed client for all backend interactions
 */

const API_BASE = process.env.NEXT_PUBLIC_FACILITATOR_API || 'http://localhost:3001';

// --- Auth ---

export async function siweChallenge(address: string): Promise<{ message: string; nonce: string }> {
  const res = await fetch(`${API_BASE}/v1/auth/siwe/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function siweVerify(message: string, signature: string): Promise<{ token: string; developer: Developer }> {
  const res = await fetch(`${API_BASE}/v1/auth/siwe/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getSession(token: string): Promise<{ developer: Developer }> {
  const res = await fetch(`${API_BASE}/v1/auth/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// --- Developer ---

export async function getMe(token: string): Promise<{ developer: Developer }> {
  const res = await fetch(`${API_BASE}/v1/developer/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// --- Routes ---

export async function getRoutes(token: string): Promise<{ routes: ApiRoute[] }> {
  const res = await fetch(`${API_BASE}/v1/developer/routes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function createRoute(token: string, data: CreateRouteInput): Promise<{ route: ApiRoute }> {
  const res = await fetch(`${API_BASE}/v1/developer/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function deleteRoute(token: string, routeId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/developer/routes/${routeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
}

export async function toggleRoute(token: string, routeId: string, isActive: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/developer/routes/${routeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
}

// --- Analytics ---

export async function getAnalytics(token: string): Promise<{ analytics: DeveloperAnalytics }> {
  const res = await fetch(`${API_BASE}/v1/developer/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// --- Facilitator ---

export async function getFacilitatorStatus(): Promise<FacilitatorStatus> {
  const res = await fetch(`${API_BASE}/v1/facilitator/status`);
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

// --- Webhooks ---

export async function getWebhooks(token: string): Promise<{ webhooks: Webhook[] }> {
  const res = await fetch(`${API_BASE}/v1/developer/webhooks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function createWebhook(token: string, data: { url: string; events: string[] }): Promise<{ webhook: Webhook }> {
  const res = await fetch(`${API_BASE}/v1/developer/webhooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function deleteWebhook(token: string, webhookId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/developer/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
}

// --- Types ---

export interface Developer {
  id: string;
  email?: string;
  name?: string;
  company?: string;
  walletAddress: string;
  plan: string;
  rateLimitRpm?: number;
  apiKey?: string;
}

export interface ApiRoute {
  id: string;
  route_path: string;
  target_url: string;
  method: string;
  price_usd: number;
  price_unit: string;
  description?: string;
  is_active: boolean;
  total_calls: number;
  total_revenue_usd: number;
  created_at: string;
}

export interface CreateRouteInput {
  routePath: string;
  targetUrl: string;
  method?: string;
  priceUsd?: number;
  priceUnit?: string;
  description?: string;
}

export interface DeveloperAnalytics {
  totalCalls: number;
  totalVolumeUSD: string;
  totalFeesUSD: string;
  recentSettlements: Settlement[];
}

export interface Settlement {
  id: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount_usd: number;
  fee_usd: number;
  status: string;
  created_at: string;
}

export interface FacilitatorStatus {
  contractAddress: string;
  feeBps: number;
  feePercent: number;
  treasury: string;
  totalSettled: number;
  totalTransactions: number;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  created_at: string;
}
