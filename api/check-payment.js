// Vercel Serverless Function — polls a payment's current status via
// whichever gateway the church has configured (falling back to the
// platform's shared Mercado Pago account).

import { getActiveGateway, updateContributionStatus, getContributionByMpPaymentId } from './_lib/supabaseAdmin.js';
import { getConnector } from './_lib/connectors/index.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id, brandId } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Missing payment id' });
    return;
  }

  const gateway = await getActiveGateway(brandId);
  const provider = gateway?.provider || 'mercadopago';
  const accessToken = gateway?.credentials?.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    res.status(500).json({ error: 'Nenhum gateway de pagamento configurado' });
    return;
  }

  try {
    const connector = getConnector(provider);
    const data = await connector.checkStatus(accessToken, id);

    const mappedStatus = data.status === 'approved' ? 'approved' : data.status === 'rejected' ? 'rejected' : data.status === 'refunded' ? 'refunded' : data.status === 'cancelled' ? 'canceled' : 'pending';

    // Read-before-write, same idempotent rule as the webhook handler: never
    // clobber an already-set approved_at, never regress a terminal status
    // back to pending on a stale/out-of-order read.
    const existing = await getContributionByMpPaymentId(String(data.id));
    const isRegression = existing && ['approved', 'rejected', 'refunded', 'canceled'].includes(existing.status) && mappedStatus === 'pending';

    if (!isRegression) {
      await updateContributionStatus(String(data.id), {
        status: mappedStatus,
        provider,
        mp_status_detail: data.status_detail || null,
        approved_at: mappedStatus === 'approved' && !existing?.approved_at ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(`${provider} status check failed:`, err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch payment' });
  }
}
