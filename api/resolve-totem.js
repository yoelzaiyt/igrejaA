// Vercel Serverless Function — resolves (or lazily creates) a `totems` row
// for a kiosk device, identified by a simple church_id+label pair. Public,
// like create-payment.js/check-payment.js: the totem itself has no logged-in
// session. Upsert-by-label is the minimal-friction approach that fits the
// existing `totems` schema without a device-registration admin UI.

import { supabaseAdminFetch, churchExists, checkRateLimit } from './_lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { churchId, label } = req.body || {};
  if (!churchId || !label) {
    res.status(400).json({ error: 'Missing churchId or label' });
    return;
  }

  // Endpoint público (sem login) -- limita por IP pra impedir um script
  // criando registros de totem em massa. 30/5min é folgado pro pareamento
  // real de um kiosk (acontece uma vez por dispositivo, não em rajada).
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!(await checkRateLimit(`resolve-totem:${clientIp}`, 30, 300))) {
    res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
    return;
  }
  if (!(await churchExists(churchId))) {
    res.status(400).json({ error: 'Igreja inválida' });
    return;
  }

  try {
    const existing = await supabaseAdminFetch(
      `totems?church_id=eq.${encodeURIComponent(churchId)}&label=eq.${encodeURIComponent(label)}&select=id&limit=1`
    );
    if (existing.ok) {
      const rows = await existing.json();
      if (rows[0]?.id) {
        res.status(200).json({ id: rows[0].id });
        return;
      }
    }

    const created = await supabaseAdminFetch('totems', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        church_id: churchId,
        label,
        device_type: 'totem',
        status: 'unknown',
      }),
    });

    if (!created.ok) {
      console.error('Failed to create totem:', created.status, await created.text());
      res.status(500).json({ error: 'Failed to resolve totem' });
      return;
    }

    const rows = await created.json();
    res.status(200).json({ id: rows[0]?.id });
  } catch (err) {
    console.error('resolve-totem error:', err);
    res.status(500).json({ error: 'Unexpected error' });
  }
}
