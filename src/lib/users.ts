import { supabase } from './supabase';

export interface AdminUserRow {
  id: string;
  email: string | null;
  role: string;
  brandId: string | null;
  createdAt: string;
}

export type AssignableRole = 'master' | 'church_admin' | 'campus_admin' | 'viewer';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function listUsers(): Promise<AdminUserRow[]> {
  const headers = await authHeaders();
  const res = await fetch('/api/list-users', { headers });
  if (!res.ok) return [];
  const rows = await res.json();
  return (rows as Array<{ id: string; email: string | null; role: string; brand_id: string | null; created_at: string }>).map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    brandId: r.brand_id,
    createdAt: r.created_at,
  }));
}

export async function createUser(
  email: string,
  role: AssignableRole,
  brandId?: string
): Promise<{ tempPassword: string | null; error: string | null }> {
  const headers = await authHeaders();
  const res = await fetch('/api/create-user', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, role, brandId }),
  });
  const data = await res.json();
  if (!res.ok) return { tempPassword: null, error: data?.error || 'Falha ao criar usuário' };
  return { tempPassword: data.tempPassword, error: null };
}
