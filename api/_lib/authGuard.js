// Validates the Supabase session token sent by the admin panel and loads
// the caller's profile (role + brand_id) via service_role. Used by any
// api/* endpoint that must only be callable by an authenticated admin.

import { supabaseAdminFetch } from './supabaseAdmin.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Returns { userId, role, brandId } or null if unauthenticated/invalid.
export async function getAuthenticatedProfile(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token || !SUPABASE_URL || !ANON_KEY) return null;

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) return null;
    const user = await userRes.json();
    if (!user?.id) return null;

    const profileRes = await supabaseAdminFetch(
      `profiles?id=eq.${encodeURIComponent(user.id)}&select=role,brand_id&limit=1`
    );
    if (!profileRes.ok) return null;
    const rows = await profileRes.json();
    const profile = rows[0];
    if (!profile) return null;

    return { userId: user.id, role: profile.role, brandId: profile.brand_id };
  } catch (err) {
    console.error('Auth guard failed:', err);
    return null;
  }
}

// A profile may manage a given church if it's master, or if it's scoped to
// that exact church.
export function canManageChurch(profile, churchId) {
  if (!profile) return false;
  return profile.role === 'master' || profile.brandId === churchId;
}

// Matriz RBAC (ROLE × RESOURCE × ACTION) espelhando as policies de RLS —
// master e church_admin administram configuração sensível (gateway de
// pagamento, WhatsApp, dados gerais); campus_admin e viewer nunca podem,
// mesmo dentro da própria igreja. Ver comentário no topo da migration
// 20260906010000_rbac_granular_write.sql para a matriz completa.
export function canManageChurchConfig(profile, churchId) {
  if (!profile) return false;
  if (profile.role === 'master') return true;
  return profile.role === 'church_admin' && profile.brandId === churchId;
}
