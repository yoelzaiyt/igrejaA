import { supabase } from './supabase';

export interface MessagingConfig {
  configured: boolean;
  provider?: string;
  instanceName?: string;
  status?: 'disconnected' | 'connecting' | 'connected';
  phoneNumber?: string | null;
  isActive?: boolean;
  lastTestedAt?: string | null;
  lastTestResult?: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function getMessagingConfig(churchId: string): Promise<MessagingConfig> {
  const headers = await authHeaders();
  const res = await fetch(`/api/messaging-config?churchId=${encodeURIComponent(churchId)}`, { headers });
  if (!res.ok) return { configured: false };
  return res.json();
}

export async function createMessagingInstance(churchId: string): Promise<{ qrCodeBase64: string | null; error: string | null }> {
  const headers = await authHeaders();
  const res = await fetch('/api/messaging-config', { method: 'POST', headers, body: JSON.stringify({ churchId }) });
  const data = await res.json();
  if (!res.ok) return { qrCodeBase64: null, error: data?.error || 'Falha ao criar instância' };
  return { qrCodeBase64: data.qrCodeBase64 || null, error: null };
}

export async function getMessagingStatus(churchId: string): Promise<{ status: string; phoneNumber: string | null }> {
  const headers = await authHeaders();
  const res = await fetch(`/api/messaging-status?churchId=${encodeURIComponent(churchId)}`, { headers });
  if (!res.ok) return { status: 'disconnected', phoneNumber: null };
  const data = await res.json();
  return { status: data.status || 'disconnected', phoneNumber: data.phoneNumber || null };
}

export async function getMessagingQrCode(churchId: string): Promise<{ qrCodeBase64: string | null; error: string | null }> {
  const headers = await authHeaders();
  const res = await fetch(`/api/messaging-qrcode?churchId=${encodeURIComponent(churchId)}`, { headers });
  const data = await res.json();
  if (!res.ok) return { qrCodeBase64: null, error: data?.error || 'Falha ao obter QR Code' };
  return { qrCodeBase64: data.qrCodeBase64 || null, error: null };
}

export async function sendTestMessage(churchId: string, to: string, message: string): Promise<{ success: boolean; error: string | null }> {
  const headers = await authHeaders();
  const res = await fetch('/api/messaging-send', { method: 'POST', headers, body: JSON.stringify({ churchId, to, message }) });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data?.error || 'Falha ao enviar mensagem' };
  return { success: true, error: null };
}
