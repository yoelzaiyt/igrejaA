// Vercel Serverless Function — the "Enviar mensagem de teste" endpoint.
// Full validation chain before ever touching the Evolution API: auth,
// authorization (tenant), phone format, message content. Never logs or
// returns the instance token. Records the result (success/failure) on the
// gateway row and in audit_logs, without secrets.

import { getAuthenticatedProfile, canManageChurch } from './_lib/authGuard.js';
import { supabaseAdminFetch, getMessagingGateway, recordAuditEvent } from './_lib/supabaseAdmin.js';
import { getMessagingProvider } from './_lib/messaging/index.js';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

// Aceita dígitos com ou sem +55/DDI; normaliza pro formato que a Evolution
// espera (DDI+DDD+número, só dígitos). Não aceita números claramente
// inválidos (curtos demais) em vez de deixar a Evolution rejeitar sem
// explicação.
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length === 12 || digits.length === 13) return digits;
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const profile = await getAuthenticatedProfile(req);
  if (!profile) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  const { churchId, to, message } = req.body || {};
  if (!churchId || !canManageChurch(profile, churchId)) {
    res.status(403).json({ error: 'Sem permissão para esta igreja' });
    return;
  }

  const normalizedTo = normalizePhone(to);
  if (!normalizedTo) {
    res.status(400).json({ error: 'Telefone inválido — use DDD + número (ex: 11999999999)' });
    return;
  }

  const text = String(message || '').trim();
  if (!text) {
    res.status(400).json({ error: 'Mensagem vazia' });
    return;
  }
  if (text.length > 1000) {
    res.status(400).json({ error: 'Mensagem muito longa (máximo 1000 caracteres)' });
    return;
  }

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    res.status(500).json({ error: 'Evolution API não configurada na plataforma' });
    return;
  }

  const gw = await getMessagingGateway(churchId);
  if (!gw || !gw.isActive) {
    res.status(400).json({ error: 'Nenhuma instância de WhatsApp ativa para esta igreja' });
    return;
  }

  const provider = getMessagingProvider(gw.provider);
  const now = new Date().toISOString();

  try {
    await provider.sendText(
      { apiUrl: EVOLUTION_API_URL, apiKey: EVOLUTION_API_KEY },
      { instanceName: gw.instanceName, instanceToken: gw.instanceToken, to: normalizedTo, message: text }
    );

    await supabaseAdminFetch(`messaging_gateways?id=eq.${gw.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_tested_at: now, last_test_result: 'success' }),
    });
    await recordAuditEvent({
      actor_id: profile.userId,
      action: 'whatsapp.test_send',
      target_type: 'messaging_gateway',
      target_id: gw.id,
      brand_id: churchId,
      metadata: { result: 'success' },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    await supabaseAdminFetch(`messaging_gateways?id=eq.${gw.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_tested_at: now, last_test_result: 'failure' }),
    });
    await recordAuditEvent({
      actor_id: profile.userId,
      action: 'whatsapp.test_send',
      target_type: 'messaging_gateway',
      target_id: gw.id,
      brand_id: churchId,
      metadata: { result: 'failure', error: err.message },
    });

    res.status(err.status || 502).json({ success: false, error: err.message || 'Falha ao enviar mensagem' });
  }
}
