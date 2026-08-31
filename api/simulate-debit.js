// Vercel Serverless Function — debit has no real terminal/Mercado Pago Point
// integration yet (see plan decision), but every attempt must still produce
// a ledger row like every other method. This endpoint just records the
// simulated attempt and its outcome; it never touches real money or PCI data.

import { recordContributionReturning, updateContributionById, churchExists, totemBelongsToChurch, recordAuditEvent } from './_lib/supabaseAdmin.js';

const OUTCOME_TO_STATUS = {
  approved: 'approved',
  declined: 'rejected',
  canceled: 'canceled',
  error: 'canceled',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { action } = req.body || {};

  if (action === 'start') {
    const { category, amount, brandId, totemId } = req.body || {};
    const transactionAmount = Number(amount);
    if (!transactionAmount || transactionAmount <= 0 || !brandId) {
      res.status(400).json({ error: 'Invalid amount or missing brandId' });
      return;
    }
    if (!(await churchExists(brandId))) {
      res.status(400).json({ error: 'Igreja inválida' });
      return;
    }
    if (!totemId || !(await totemBelongsToChurch(totemId, brandId))) {
      await recordAuditEvent({
        action: 'payment.rejected_totem_tenant_mismatch',
        target_type: 'totem',
        target_id: totemId || null,
        brand_id: brandId,
        metadata: { method: 'debit', amount: transactionAmount, category },
      });
      res.status(400).json({ error: 'Totem não vinculado a esta igreja' });
      return;
    }

    const row = await recordContributionReturning({
      church_id: brandId,
      totem_id: totemId || null,
      category: category || 'Contribuição',
      method: 'debit',
      provider: 'simulated',
      amount_cents: Math.round(transactionAmount * 100),
      status: 'pending',
    });

    if (!row) {
      res.status(500).json({ error: 'Failed to start simulated debit' });
      return;
    }

    res.status(200).json({ id: row.id });
    return;
  }

  if (action === 'resolve') {
    const { id, outcome, errorDetail } = req.body || {};
    const status = OUTCOME_TO_STATUS[outcome];
    if (!id || !status) {
      res.status(400).json({ error: 'Invalid id or outcome' });
      return;
    }

    const patch = { status, updated_at: new Date().toISOString() };
    if (status === 'approved') patch.approved_at = new Date().toISOString();
    if (outcome === 'declined' || outcome === 'error') {
      patch.error_detail = errorDetail || (outcome === 'error' ? 'Erro simulado no terminal' : 'Recusado (simulação)');
    }

    await updateContributionById(id, patch);
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ error: 'Unknown action' });
}
