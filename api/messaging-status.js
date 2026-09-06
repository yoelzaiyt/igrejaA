// Vercel Serverless Function — checks the real connection state of a
// church's WhatsApp instance against the Evolution API and syncs it into
// our own row (so the admin UI reflects reality, not a stale local guess).

import { getAuthenticatedProfile, canManageChurch } from './_lib/authGuard.js';
import { supabaseAdminFetch, getMessagingGateway } from './_lib/supabaseAdmin.js';
import { getMessagingProvider } from './_lib/messaging/index.js';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

const STATE_MAP = { open: 'connected', connecting: 'connecting', close: 'disconnected' };

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

  const churchId = req.query.churchId;
  if (!churchId || !canManageChurch(profile, churchId)) {
    res.status(403).json({ error: 'Sem permissão para esta igreja' });
    return;
  }

  const gw = await getMessagingGateway(churchId);
  if (!gw) {
    res.status(200).json({ configured: false, status: 'disconnected' });
    return;
  }

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    res.status(200).json({ configured: true, status: gw.status, phoneNumber: gw.phoneNumber, stale: true });
    return;
  }

  try {
    const provider = getMessagingProvider(gw.provider);
    const { state } = await provider.getConnectionState(
      { apiUrl: EVOLUTION_API_URL, apiKey: EVOLUTION_API_KEY },
      { instanceName: gw.instanceName }
    );
    const mapped = STATE_MAP[state] || 'disconnected';

    if (mapped !== gw.status) {
      await supabaseAdminFetch(`messaging_gateways?id=eq.${gw.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: mapped }),
      });
    }

    res.status(200).json({ configured: true, status: mapped, phoneNumber: gw.phoneNumber });
  } catch (err) {
    res.status(200).json({ configured: true, status: gw.status, phoneNumber: gw.phoneNumber, error: err.message });
  }
}
