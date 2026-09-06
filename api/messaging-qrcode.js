// Vercel Serverless Function — returns a fresh QR code (base64 image) to
// connect a church's WhatsApp instance. Only ever returns the QR image,
// never the global or instance API key.

import { getAuthenticatedProfile, canManageChurch } from './_lib/authGuard.js';
import { getMessagingGateway } from './_lib/supabaseAdmin.js';
import { getMessagingProvider } from './_lib/messaging/index.js';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

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

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    res.status(500).json({ error: 'Evolution API não configurada na plataforma' });
    return;
  }

  const gw = await getMessagingGateway(churchId);
  if (!gw) {
    res.status(404).json({ error: 'Instância ainda não criada para esta igreja' });
    return;
  }

  try {
    const provider = getMessagingProvider(gw.provider);
    const { qrCodeBase64 } = await provider.getQrCode(
      { apiUrl: EVOLUTION_API_URL, apiKey: EVOLUTION_API_KEY },
      { instanceName: gw.instanceName }
    );
    res.status(200).json({ qrCodeBase64 });
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message || 'Falha ao obter QR Code' });
  }
}
