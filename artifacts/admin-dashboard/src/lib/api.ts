const BASE = import.meta.env.BASE_URL; // trailing slash included

export function getToken(): string | null {
  return sessionStorage.getItem('ep_admin_token');
}

export function setToken(t: string) {
  sessionStorage.setItem('ep_admin_token', t);
}

export function clearToken() {
  sessionStorage.removeItem('ep_admin_token');
}

function authHeaders(): Record<string, string> {
  const tok = getToken();
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

export async function adminAuth(password: string): Promise<{ token: string }> {
  const r = await fetch(`${BASE}api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!r.ok) throw new Error('Invalid password');
  return r.json();
}

export interface AdminMetrics {
  ai: {
    totalCalls: number;
    todayCalls: number;
    todayCostUsd: number;
    totalCostUsd: number;
    totalTokensIn: number;
    totalTokensOut: number;
    errorRate: number;
    avgLatencyMs: number;
    callsByDay: { date: string; calls: number; costUsd: number }[];
    callsBySubject: Record<string, number>;
  };
  server: {
    uptimeSeconds: number;
    nodeVersion: string;
    pid: number;
  };
  flags: {
    total: number;
    pending: number;
    resolved: number;
  };
}

export async function fetchMetrics(): Promise<AdminMetrics> {
  const r = await fetch(`${BASE}api/admin/metrics`, { headers: authHeaders() });
  if (r.status === 401) throw new Error('UNAUTHORIZED');
  if (!r.ok) throw new Error('Failed to load metrics');
  return r.json();
}

export interface FlagRecord {
  id: string;
  questionId: number;
  subject: string;
  questionText: string;
  reason: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

export async function fetchFlags(): Promise<FlagRecord[]> {
  const r = await fetch(`${BASE}api/admin/flags`, { headers: authHeaders() });
  if (r.status === 401) throw new Error('UNAUTHORIZED');
  if (!r.ok) throw new Error('Failed to load flags');
  return r.json();
}

export async function resolveFlag(id: string): Promise<void> {
  const r = await fetch(`${BASE}api/admin/flags/${id}/resolve`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!r.ok) throw new Error('Failed to resolve flag');
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${seconds % 60}s`;
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return '<$0.001';
  return `$${usd.toFixed(4)}`;
}

export function formatNgn(amount: number): string {
  return '₦' + amount.toLocaleString('en-NG');
}
