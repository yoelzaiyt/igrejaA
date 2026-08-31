// Vercel Serverless Function — tells the totem which payment methods a
// church has enabled, so DonationView only offers PIX/Crédito/Débito the
// church actually wants to accept. Public (no login) like the other
// totem-facing endpoints; returns no sensitive data.

import { getActiveGateway, churchExists } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { churchId } = req.query;
  if (!churchId || !(await churchExists(churchId))) {
    res.status(200).json({ methods: ['pix', 'credit', 'debit'] });
    return;
  }

  const gateway = await getActiveGateway(churchId);
  // No church-specific gateway configured yet -> shared platform account,
  // no restriction.
  res.status(200).json({ methods: gateway?.enabledMethods || ['pix', 'credit', 'debit'] });
}
