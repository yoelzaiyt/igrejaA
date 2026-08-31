// Vercel Serverless Function — receives Mercado Pago's payment notifications.
// This is the primary source of truth for payment status; the 4s client
// poll and the "Já Paguei" button in DonationView remain only as a fast-path
// UX nicety, not the only mechanism (if the totem browser closes/reloads
// mid-PIX, this is what still learns the payment completed).
//
// Never trusts status/amount from the notification body itself — always
// re-fetches the real payment from Mercado Pago with a trusted, server-side
// access token before writing anything. That substitutes for HMAC signature
// validation (not implemented here): a forged POST can only trigger a
// redundant real status re-check, never inject a fake "approved" state.

import { decryptCredentials } from './_lib/crypto.js';
import {
  getContributionByMpPaymentId,
  updateContributionStatus,
  listActiveGateways,
} from './_lib/supabaseAdmin.js';
import { getConnector } from './_lib/connectors/index.js';

const SHARED_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export default async function handler(req, res) {
  // Mercado Pago retries on non-2xx, so this handler always answers 200/202
  // once it has done what it safely can — even when it couldn't fully
  // resolve which church/token to use (the client poll remains a safety net
  // for that specific payment in that case).
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(200).json({ received: true });
    return;
  }

  const type = req.body?.type || req.body?.topic || req.query?.type || req.query?.topic;
  const paymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id;

  if (type && type !== 'payment') {
    // merchant_order and other notification types aren't relevant here.
    res.status(200).json({ ignored: type });
    return;
  }
  if (!paymentId) {
    res.status(200).json({ ignored: 'missing payment id' });
    return;
  }

  try {
    const connector = getConnector('mercadopago');
    const existing = await getContributionByMpPaymentId(String(paymentId));

    let accessToken = null;
    if (existing) {
      accessToken = await resolveTokenForChurch(existing.church_id, existing.provider);
    }
    if (!accessToken) accessToken = SHARED_TOKEN;
    if (!accessToken) accessToken = await tryEveryActiveGatewayToken();

    if (!accessToken) {
      console.warn('mercadopago-webhook: no token resolved for payment', paymentId);
      res.status(200).json({ resolved: false });
      return;
    }

    const data = await connector.checkStatus(accessToken, paymentId);
    const mappedStatus =
      data.status === 'approved' ? 'approved' :
      data.status === 'rejected' ? 'rejected' :
      data.status === 'refunded' ? 'refunded' :
      data.status === 'cancelled' ? 'canceled' : 'pending';

    // Idempotent by construction: replaying the same notification (Mercado
    // Pago is known to redeliver) produces an identical, harmless PATCH.
    const isRegression =
      existing &&
      ['approved', 'rejected', 'refunded', 'canceled'].includes(existing.status) &&
      mappedStatus === 'pending';

    if (!isRegression) {
      await updateContributionStatus(String(paymentId), {
        status: mappedStatus,
        mp_status_detail: data.status_detail || null,
        approved_at: mappedStatus === 'approved' && !existing?.approved_at ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      });
    }

    res.status(200).json({ resolved: true, status: mappedStatus });
  } catch (err) {
    console.error('mercadopago-webhook error:', err);
    // Still 200 — MP retrying won't help with a bug on our side, and the
    // client poll/manual recheck remain as fallbacks for this payment.
    res.status(200).json({ resolved: false, error: err.message });
  }
}

async function resolveTokenForChurch(churchId, provider) {
  if (!churchId) return null;
  try {
    const gateways = await listActiveGateways();
    const row = gateways.find((g) => g.church_id === churchId && g.provider === (provider || 'mercadopago'));
    if (!row?.credentials_encrypted) return null;
    const credentials = decryptCredentials({
      ciphertext: row.credentials_encrypted,
      iv: row.credentials_iv,
      authTag: row.credentials_auth_tag,
    });
    return credentials?.accessToken || null;
  } catch (err) {
    console.error('resolveTokenForChurch failed:', err);
    return null;
  }
}

async function tryEveryActiveGatewayToken() {
  const gateways = await listActiveGateways();
  for (const row of gateways) {
    if (!row.credentials_encrypted) continue;
    try {
      const credentials = decryptCredentials({
        ciphertext: row.credentials_encrypted,
        iv: row.credentials_iv,
        authTag: row.credentials_auth_tag,
      });
      if (credentials?.accessToken) return credentials.accessToken;
    } catch {
      // try the next one
    }
  }
  return null;
}
