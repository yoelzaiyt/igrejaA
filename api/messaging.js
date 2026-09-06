// Vercel Serverless Function — todos os endpoints de mensageria (WhatsApp/
// Evolution API) num único arquivo, roteados por `action`. Consolidado pra
// não estourar o limite de funções serverless do plano Vercel (12) --
// mesmo princípio de "uma rota, múltiplas ações" já usado em
// api/gateway-config.js (GET/POST no mesmo arquivo), só que com um `action`
// explícito porque aqui são 4 operações, não 2.
//
// GET  ?action=config&churchId=...  -> config atual (mascarada)
// POST { action:'config', churchId }            -> cria a instância
// GET  ?action=status&churchId=...  -> sincroniza status com a Evolution
// GET  ?action=qrcode&churchId=...  -> QR Code fresco pra conectar
// POST { action:'send', churchId, to, message }  -> envia mensagem de teste

import { getAuthenticatedProfile, canManageChurch, canManageChurchConfig } from './_lib/authGuard.js';
import { supabaseAdminFetch, getMessagingGateway, recordAuditEvent } from './_lib/supabaseAdmin.js';
import { encryptCredentials } from './_lib/crypto.js';
import { getMessagingProvider } from './_lib/messaging/index.js';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const STATE_MAP = { open: 'connected', connecting: 'connecting', close: 'disconnected' };

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length === 12 || digits.length === 13) return digits;
  return null;
}

export default async function handler(req, res) {
  const profile = await getAuthenticatedProfile(req);
  if (!profile) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  const action = req.method === 'GET' ? req.query.action : req.body?.action;
  const churchId = req.method === 'GET' ? req.query.churchId : req.body?.churchId;

  if (!churchId || !canManageChurch(profile, churchId)) {
    res.status(403).json({ error: 'Sem permissão para esta igreja' });
    return;
  }
  // Conectar instância e enviar mensagem são ações sensíveis (a segunda
  // literalmente usa o número/instância da igreja) -- campus_admin e viewer
  // podem consultar status/QR (GET), mas nunca criar instância nem enviar.
  if (req.method === 'POST' && !canManageChurchConfig(profile, churchId)) {
    res.status(403).json({ error: 'Sem permissão para configurar ou enviar mensagens' });
    return;
  }

  // ── GET ?action=config ──────────────────────────────────────────────
  if (req.method === 'GET' && action === 'config') {
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

  // ── POST { action: 'config' } — cria a instância ────────────────────
  if (req.method === 'POST' && action === 'config') {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      res.status(500).json({ error: 'Evolution API não configurada na plataforma (EVOLUTION_API_URL/EVOLUTION_API_KEY ausentes)' });
      return;
    }
    const existing = await getMessagingGateway(churchId);
    if (existing) {
      res.status(200).json({ configured: true, instanceName: existing.instanceName, status: existing.status });
      return;
    }
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

  // ── GET ?action=status — sincroniza com a Evolution ─────────────────
  if (req.method === 'GET' && action === 'status') {
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
    return;
  }

  // ── GET ?action=qrcode ───────────────────────────────────────────────
  if (req.method === 'GET' && action === 'qrcode') {
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
    return;
  }

  // ── POST { action: 'send' } — mensagem de teste ─────────────────────
  if (req.method === 'POST' && action === 'send') {
    const { to, message } = req.body || {};
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
    return;
  }

  res.status(400).json({ error: 'Ação inválida' });
}
