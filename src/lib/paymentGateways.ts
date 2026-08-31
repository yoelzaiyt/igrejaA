import { supabase } from './supabase';

export type GatewayProvider = 'mercadopago' | 'stone' | 'cielo' | 'pagbank';

export type PaymentMethod = 'pix' | 'credit' | 'debit';

export interface GatewaySummary {
  id: string;
  provider: GatewayProvider;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_result: 'success' | 'failure' | null;
  updated_at: string;
  enabled_methods: PaymentMethod[];
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listGateways(churchId: string): Promise<GatewaySummary[]> {
  const headers = await authHeader();
  const res = await fetch(`/api/gateway-config?churchId=${encodeURIComponent(churchId)}`, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return data.gateways || [];
}

export async function saveGateway(
  churchId: string,
  provider: GatewayProvider,
  credentials: Record<string, string>,
  enabledMethods: PaymentMethod[]
): Promise<{ success: boolean; testResult?: string; error?: string }> {
  const headers = await authHeader();
  const res = await fetch('/api/gateway-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ action: 'save', churchId, provider, credentials, enabledMethods }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return data;
}

export async function testGateway(
  churchId: string,
  provider: GatewayProvider,
  credentials?: Record<string, string>
): Promise<{ success: boolean; error?: string; nickname?: string }> {
  const headers = await authHeader();
  const res = await fetch('/api/gateway-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ action: 'test', churchId, provider, credentials }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return data;
}

export async function toggleGateway(
  churchId: string,
  provider: GatewayProvider,
  isActive: boolean
): Promise<boolean> {
  const headers = await authHeader();
  const res = await fetch('/api/gateway-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ action: 'toggle', churchId, provider, isActive }),
  });
  return res.ok;
}
