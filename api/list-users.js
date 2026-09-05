// Vercel Serverless Function — lists admin accounts (profiles) the caller is
// allowed to manage. Not exposed via RLS on purpose: profiles has no policy
// letting one user list OTHER users' rows, and it should stay that way (a
// broad "authenticated can read all profiles" policy would leak every
// church's admin emails to every other church's admin). This endpoint is
// the single, server-validated door into that data instead.

import { getAuthenticatedProfile } from './_lib/authGuard.js';
import { supabaseAdminFetch } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const profile = await getAuthenticatedProfile(req);
  if (!profile) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  const query =
    profile.role === 'master'
      ? 'profiles?select=id,email,role,brand_id,created_at&order=created_at.desc'
      : `profiles?select=id,email,role,brand_id,created_at&brand_id=eq.${encodeURIComponent(profile.brandId || '')}&order=created_at.desc`;

  const r = await supabaseAdminFetch(query);
  if (!r.ok) {
    res.status(502).json({ error: 'Falha ao consultar usuários' });
    return;
  }
  const rows = await r.json();
  res.status(200).json(rows);
}
