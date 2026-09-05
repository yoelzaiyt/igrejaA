// Vercel Serverless Function — explicit "Cancelar" on a still-open PIX.
// Tells Mercado Pago to void the payment and marks the ledger row canceled
// right away, instead of leaving it `pending` until natural expiration.

import { getActiveGateway, updateContributionStatus, getContributionByMpPaymentId, churchExists, recordAuditEvent } from './_lib/supabaseAdmin.js';
import { getConnector } from './_lib/connectors/index.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id, brandId } = req.body || {};
  if (!id) {
    res.status(400).json({ error: 'Missing payment id' });
    return;
  }
  if (!brandId || !(await churchExists(brandId))) {
    res.status(400).json({ error: 'Invalid church' });
    return;
  }

  // Tenant check BEFORE touching the provider: without this, a request
  // carrying someone else's real payment id + a different brandId could
  // cancel a stranger's PIX at Mercado Pago before we ever noticed the
  // mismatch. `existing` must exist and belong to this church — create-
  // payment.js always records the contribution before returning, so any
  // legitimately cancelable PIX already has a row here.
  const existing = await getContributionByMpPaymentId(String(id));
  if (!existing || existing.church_id !== brandId) {
    await recordAuditEvent({
      action: 'payment.rejected_cancel_tenant_mismatch',
      target_type: 'contribution',
      target_id: String(id),
      brand_id: brandId,
    });
    res.status(400).json({ error: 'Pagamento não encontrado para esta igreja' });
    return;
  }

  const gateway = await getActiveGateway(brandId);
  const provider = gateway?.provider || 'mercadopago';
  const accessToken = gateway?.credentials?.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    // Nothing to cancel at the provider without a token — still let the
    // shopper leave; the row just stays pending until it naturally expires.
    res.status(200).json({ success: false });
    return;
  }

  try {
    const connector = getConnector(provider);
    await connector.cancelPayment(accessToken, id);
  } catch (err) {
    // A payment that already settled (approved/rejected) can't be cancelled
    // at Mercado Pago — that's fine, not an error worth surfacing here.
    console.warn('cancel-payment: provider cancel failed (may already be settled):', err.message);
  }

  // Never overwrite a payment that settled right as the shopper tapped
  // Cancelar — a race between "approved" arriving and this request must
  // never flip an already-approved contribution back to canceled.
  const alreadyTerminal = ['approved', 'rejected', 'refunded', 'canceled'].includes(existing.status);
  if (!alreadyTerminal) {
    await updateContributionStatus(String(id), {
      status: 'canceled',
      updated_at: new Date().toISOString(),
    });
  }

  res.status(200).json({ success: true });
}
