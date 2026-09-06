// Vercel Serverless Function — reads/creates the church's WhatsApp (Evolution
// API) instance config. Mirrors api/gateway-config.js exactly: server-side
// authGuard, never trusts churchId from an unauthenticated caller, never
// returns the instance token to the browser.

import { getAuthenticatedProfile, canManageChurch } from './_lib/authGuard.js';
import { supabaseAdminFetch, getMessagingGateway } from './_lib/supabaseAdmin.js';
import { encryptCredentials } from './_lib/crypto.js';
import { getMessagingProvider } from './_lib/messaging/index.js';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export default async function handler(req, res) {
  const profile = await getAuthenticatedProfile(req);
  if (!profile) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  if (req.method === 'GET') {
    const churchId = req.query.churchId;
    if (!churchId || !canManageChurch(profile, churchId)) {
      res.status(403).json({ error: 'Sem permissão para esta igreja' });
      return;
    }
    const gw = await getMessagingGateway(churchId);
    if (!gw) {
      res.status(200).json({ configured: false });
      return;
    }
    res.status(200).json({
      configured: true,
      provider: gw.provider,
      instanceName: gw.instanceName,
      status: gw.status,
      phoneNumber: gw.phoneNumber,
      isActive: gw.isActive,
      lastTestedAt: gw.lastTestedAt,
      lastTestResult: gw.lastTestResult,
    });
    return;
  }

  if (req.method === 'POST') {
    const { churchId } = req.body || {};
    if (!churchId || !canManageChurch(profile, churchId)) {
      res.status(403).json({ error: 'Sem permissão para esta igreja' });
      return;
    }
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      res.status(500).json({ error: 'Evolution API não configurada na plataforma (EVOLUTION_API_URL/EVOLUTION_API_KEY ausentes)' });
      return;
    }

    const existing = await getMessagingGateway(churchId);
    if (existing) {
      res.status(200).json({ configured: true, instanceName: existing.instanceName, status: existing.status });
      return;
    }

    // Nome de instância determinístico e único por igreja — replicável pra
    // qualquer organização nova sem colisão.
    const instanceName = `santuario-${churchId}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const provider = getMessagingProvider('evolution');

    try {
      const { instanceToken, qrCodeBase64 } = await provider.createInstance(
        { apiUrl: EVOLUTION_API_URL, apiKey: EVOLUTION_API_KEY },
        { instanceName }
      );

      const encrypted = instanceToken ? encryptCredentials({ token: instanceToken }) : null;

      const insertRes = await supabaseAdminFetch('messaging_gateways', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          church_id: churchId,
          provider: 'evolution',
          instance_name: instanceName,
          instance_token_encrypted: encrypted?.ciphertext || null,
          instance_token_iv: encrypted?.iv || null,
          instance_token_auth_tag: encrypted?.authTag || null,
          status: 'connecting',
        }),
      });
      if (!insertRes.ok) {
        res.status(502).json({ error: 'Falha ao salvar configuração da instância' });
        return;
      }

      res.status(200).json({ configured: true, instanceName, qrCodeBase64 });
    } catch (err) {
      res.status(err.status || 502).json({ error: err.message || 'Falha ao criar instância na Evolution API' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
