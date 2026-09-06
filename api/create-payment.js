// Vercel Serverless Function — creates a real payment (PIX or credit card)
// via whichever gateway the church has configured, falling back to the
// platform's shared Mercado Pago account when no church-specific gateway
// is active. Runs server-side only: credentials never reach the browser.

import { getActiveGateway, recordContribution, getContributionByIdempotencyKey, churchExists, totemBelongsToChurch, recordAuditEvent, checkRateLimit } from './_lib/supabaseAdmin.js';
import { getConnector } from './_lib/connectors/index.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { method, amount, description, category, brandId, card, idempotencyKey, totemId } = req.body || {};

  // Endpoint anônimo (visitante do totem, sem login) -- limita por IP pra
  // impedir um script martelando criação de cobranças reais no Mercado
  // Pago. 20 por 5 min é folgado pra uso real (várias pessoas doando no
  // mesmo totem/rede) e aperta contra automação.
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const rateOk = await checkRateLimit(`create-payment:${clientIp}`, 20, 300);
  if (!rateOk) {
    res.status(429).json({ error: 'Muitas tentativas de pagamento. Aguarde alguns minutos.' });
    return;
  }

  const transactionAmount = Number(amount);
  if (!transactionAmount || transactionAmount <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  // Never trust brandId blindly — an unknown/typo'd tenant must not be able
  // to create a payment or an orphaned ledger row.
  if (!brandId || !(await churchExists(brandId))) {
    res.status(400).json({ error: 'Igreja inválida' });
    return;
  }

  // Every financial request must carry a totem that's actually bound to the
  // claimed church — otherwise a real totemId (leaked/reused) paired with a
  // different brandId could misattribute a contribution to the wrong tenant.
  // Rejected attempts are never silently dropped: they're audited so a
  // pattern of mismatches is visible to an admin.
  if (!totemId || !(await totemBelongsToChurch(totemId, brandId))) {
    await recordAuditEvent({
      action: 'payment.rejected_totem_tenant_mismatch',
      target_type: 'totem',
      target_id: totemId || null,
      brand_id: brandId,
      metadata: { method, amount: transactionAmount, category },
    });
    res.status(400).json({ error: 'Totem não vinculado a esta igreja' });
    return;
  }

  // A retried/duplicated submit for the SAME logical attempt (double-tap that
  // slipped past the UI guard, or a client retry after a timeout) must never
  // create a second charge — short-circuit if we've already recorded this key.
  if (idempotencyKey) {
    const existing = await getContributionByIdempotencyKey(idempotencyKey);
    if (existing) {
      res.status(200).json({
        id: existing.mp_payment_id,
        status: existing.status,
        status_detail: existing.mp_status_detail,
      });
      return;
    }
  }

  const gateway = await getActiveGateway(brandId);
  const provider = gateway?.provider || 'mercadopago';
  const accessToken = gateway?.credentials?.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    res.status(500).json({ error: 'Nenhum gateway de pagamento configurado' });
    return;
  }

  const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
  // Mercado Pago validates notification_url server-side and rejects anything
  // that isn't a real public HTTPS host — a local host (vercel dev, vite
  // proxy) makes the whole payment creation fail with "notificaction_url
  // attribute must be url valid". Omitting it is safe: the webhook is only
  // ever a fast-path (see mercadopago-webhook.js's own header comment) —
  // the client poll ("Já Paguei, Verificar Agora") and check-payment.js
  // remain the source of truth either way.
  const isLocalHost = forwardedHost && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(forwardedHost);
  const notificationUrl = process.env.PUBLIC_BASE_URL
    ? `${process.env.PUBLIC_BASE_URL}/api/mercadopago-webhook`
    : forwardedHost && !isLocalHost
    ? `https://${forwardedHost}/api/mercadopago-webhook`
    : undefined;

  try {
    const connector = getConnector(provider);
    const data = await connector.createPayment(accessToken, {
      method,
      transactionAmount,
      description,
      brandId,
      card,
      idempotencyKey,
      notificationUrl,
    });

    if (brandId) {
      await recordContribution({
        church_id: brandId,
        totem_id: totemId || null,
        category: category || description || 'Contribuição',
        method,
        provider,
        amount_cents: Math.round(transactionAmount * 100),
        status: data.status === 'approved' ? 'approved' : data.status === 'rejected' ? 'rejected' : 'pending',
        approved_at: data.status === 'approved' ? new Date().toISOString() : null,
        mp_payment_id: String(data.id),
        mp_status_detail: data.status_detail || null,
        idempotency_key: idempotencyKey || null,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(`${provider} payment error:`, err.details || err);
    res.status(err.status || 500).json({ error: err.message || 'Payment creation failed', details: err.details });
  }
}
