import { supabase } from './supabase';

export interface AdminProfile {
  id: string;
  role: 'master' | 'church_admin' | 'campus_admin' | 'viewer';
  brandId: string | null;
  email: string | null;
}

export async function signInAdmin(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateOwnPassword(newPassword: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { error: null };
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, brand_id, email')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return { id: data.id, role: data.role, brandId: data.brand_id, email: data.email };
}

export interface AuditLogEntry {
  id: string;
  actorEmail: string | null;
  action: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  targetType?: string | null;
  targetId?: string | null;
  brandId?: string | null;
}

// Listagem geral (não filtrada por alvo específico) pra uma tela de
// "Auditoria" -- RLS já garante master vê tudo, church_admin só a própria
// igreja (o filtro por brand_id acontece no banco, não aqui).
export async function fetchRecentAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, actor_email, action, created_at, metadata, target_type, target_id, brand_id')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch recent audit logs:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    createdAt: row.created_at,
    metadata: row.metadata,
    targetType: row.target_type,
    targetId: row.target_id,
    brandId: row.brand_id,
  }));
}

// RLS (church_scoped, Fase 4) já garante que church_admin só recebe
// entradas da própria igreja -- não precisa repetir o filtro aqui.
export async function fetchAuditLogs(targetType: string, targetId: string): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, actor_email, action, created_at, metadata')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch audit logs:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    createdAt: row.created_at,
    metadata: row.metadata,
  }));
}

export async function logAuditEvent(action: string, details: {
  targetType?: string;
  targetId?: string;
  brandId?: string;
  metadata?: Record<string, unknown>;
} = {}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  await supabase.from('audit_logs').insert({
    actor_id: user?.id,
    actor_email: user?.email,
    action,
    target_type: details.targetType,
    target_id: details.targetId,
    brand_id: details.brandId,
    metadata: details.metadata,
  });
}
