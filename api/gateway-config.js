// Vercel Serverless Function — lets an authenticated church admin configure
// their own payment gateway. Credentials are encrypted before being stored
// and never returned to the client after being saved.

import { encryptCredentials } from './_lib/crypto.js';
import { supabaseAdminFetch, getActiveGateway } from './_lib/supabaseAdmin.js';
import { getConnector } from './_lib/connectors/index.js';
import { getAuthenticatedProfile, canManageChurch, canManageChurchConfig } from './_lib/authGuard.js';

export default async function handler(req, res) {
  const profile = await getAuthenticatedProfile(req);
  if (!profile) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.method === 'GET') {
    const { churchId } = req.query;
    if (!churchId || !canManageChurch(profile, churchId)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const r = await supabaseAdminFetch(
      `payment_gateways?church_id=eq.${encodeURIComponent(churchId)}&select=id,provider,is_active,last_tested_at,last_test_result,updated_at,enabled_methods`
    );
    const rows = r.ok ? await r.json() : [];
    res.status(200).json({ gateways: rows });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { action, churchId, provider, credentials, enabledMethods } = req.body || {};
  // Configurar/testar/ativar gateway é ação sensível -- campus_admin e
  // viewer podem ver (GET acima), mas nunca escrever, mesmo na própria igreja.
  if (!churchId || !canManageChurchConfig(profile, churchId)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  if (!provider) {
    res.status(400).json({ error: 'Missing provider' });
    return;
  }

  try {
    if (action === 'test') {
      // Testa com a credencial recém-digitada (ainda não salva) OU a já salva.
      let accessToken = credentials?.accessToken;
      if (!accessToken) {
        const existing = await getActiveGatewayForProvider(churchId, provider);
        accessToken = existing?.credentials?.accessToken;
      }
      if (!accessToken) {
        res.status(400).json({ error: 'Nenhuma credencial para testar' });
        return;
      }
      const connector = getConnector(provider);
      const result = await connector.testConnection(accessToken);
      res.status(200).json({ success: true, ...result });
      return;
    }

    if (action === 'toggle') {
      const { isActive } = req.body;
      // Só um gateway ativo por igreja: desativa os outros antes de ativar este.
      if (isActive) {
        await supabaseAdminFetch(`payment_gateways?church_id=eq.${encodeURIComponent(churchId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: false }),
        });
      }
      const r = await supabaseAdminFetch(
        `payment_gateways?church_id=eq.${encodeURIComponent(churchId)}&provider=eq.${encodeURIComponent(provider)}`,
        { method: 'PATCH', body: JSON.stringify({ is_active: !!isActive, updated_at: new Date().toISOString() }) }
      );
      res.status(r.ok ? 200 : 500).json({ success: r.ok });
      return;
    }

    // action === 'save' (default)
    if (!credentials || typeof credentials !== 'object') {
      res.status(400).json({ error: 'Missing credentials' });
      return;
    }

    const { ciphertext, iv, authTag } = encryptCredentials(credentials);

    // Testa antes de salvar, pra não guardar uma credencial obviamente inválida.
    let testResult = 'success';
    try {
      const connector = getConnector(provider);
      await connector.testConnection(credentials.accessToken);
    } catch (err) {
      testResult = 'failure';
    }

    const ALL_METHODS = ['pix', 'credit', 'debit'];
    const filteredMethods = Array.isArray(enabledMethods)
      ? enabledMethods.filter((m) => ALL_METHODS.includes(m))
      : ALL_METHODS;
    // Never allow zero methods to be saved — that would leave the totem's
    // payment-method step with nothing to offer.
    const methods = filteredMethods.length > 0 ? filteredMethods : ALL_METHODS;

    const r = await supabaseAdminFetch('payment_gateways', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        church_id: churchId,
        provider,
        credentials_encrypted: ciphertext,
        credentials_iv: iv,
        credentials_auth_tag: authTag,
        enabled_methods: methods,
        last_tested_at: new Date().toISOString(),
        last_test_result: testResult,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!r.ok) {
      const errBody = await r.text();
      console.error('Failed to save gateway:', r.status, errBody);
      res.status(500).json({ error: 'Failed to save gateway configuration' });
      return;
    }

    res.status(200).json({ success: true, testResult });
  } catch (err) {
    console.error('gateway-config error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Unexpected error' });
  }
}

async function getActiveGatewayForProvider(churchId, provider) {
  const gateway = await getActiveGateway(churchId);
  if (gateway?.provider === provider) return gateway;
  return null;
}
