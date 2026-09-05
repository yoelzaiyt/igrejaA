// Vercel Serverless Function — creates a new admin account (Supabase Auth
// user + profiles row) for the Central. Runs server-side only so the rules
// below are actually enforced, never just hidden in the UI:
//
// - A church_admin can only create accounts scoped to their OWN church, and
//   never with role 'master' — brandId/role from the request body are never
//   trusted for privilege purposes, only for master (privilege escalation
//   via a tampered payload must be impossible, same principle as the
//   tenant/amount checks in create-payment.js).
// - The temporary password is generated here, returned once in the
//   response, and never written to audit_logs/logs/console.

import { randomBytes } from 'crypto';
import { getAuthenticatedProfile } from './_lib/authGuard.js';
import { supabaseAdminFetch, churchExists, recordAuditEvent } from './_lib/supabaseAdmin.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALLOWED_ROLES = ['master', 'church_admin', 'campus_admin', 'viewer'];

function generateTempPassword() {
  return randomBytes(18).toString('base64').replace(/[+/=]/g, '').slice(0, 20) + '!Aa1';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await getAuthenticatedProfile(req);
  if (!caller) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  const { email, role: requestedRole } = req.body || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ error: 'E-mail inválido' });
    return;
  }

  let role = requestedRole;
  let brandId = req.body?.brandId || null;

  if (caller.role === 'master') {
    if (!ALLOWED_ROLES.includes(role)) {
      res.status(400).json({ error: 'Papel inválido' });
      return;
    }
    if (role !== 'master' && !(await churchExists(brandId))) {
      res.status(400).json({ error: 'Igreja inválida' });
      return;
    }
    if (role === 'master') brandId = null;
  } else if (caller.role === 'church_admin') {
    // Não confia em role/brandId enviados pelo cliente além do que o próprio
    // papel do chamador autoriza — sempre a própria igreja, nunca master.
    if (!['church_admin', 'campus_admin', 'viewer'].includes(role)) {
      res.status(403).json({ error: 'Você não pode atribuir esse papel' });
      return;
    }
    brandId = caller.brandId;
  } else {
    res.status(403).json({ error: 'Sem permissão para criar usuários' });
    return;
  }

  const tempPassword = generateTempPassword();

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: tempPassword, email_confirm: true }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    res.status(createRes.status).json({ error: createData?.msg || createData?.message || 'Falha ao criar usuário' });
    return;
  }
  const userId = createData.id;

  const profileRes = await supabaseAdminFetch('profiles', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ id: userId, role, brand_id: brandId, email }),
  });
  if (!profileRes.ok) {
    // Rollback: não deixar um auth user órfão sem profile.
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    res.status(502).json({ error: 'Falha ao criar perfil do usuário' });
    return;
  }

  await recordAuditEvent({
    actor_id: caller.userId,
    actor_email: caller.role === 'master' ? 'master' : null,
    action: 'user.create',
    target_type: 'profile',
    target_id: userId,
    brand_id: brandId,
    metadata: { role, created_email: email },
  });

  res.status(200).json({ id: userId, email, role, brandId, tempPassword });
}
