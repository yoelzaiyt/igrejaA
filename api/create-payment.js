// Vercel Serverless Function — creates a real Mercado Pago payment (PIX or credit card).
// Runs server-side only: the Access Token never reaches the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'MERCADOPAGO_ACCESS_TOKEN not configured' });
    return;
  }

  const { method, amount, description, brandId, card } = req.body || {};

  const transactionAmount = Number(amount);
  if (!transactionAmount || transactionAmount <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  const payerEmail = `doador-${(brandId || 'totem').toLowerCase().replace(/[^a-z0-9]/g, '')}@santuariodigital.app`;

  let payload;

  if (method === 'pix') {
    payload = {
      transaction_amount: transactionAmount,
      description: description || 'Contribuição via Totem',
      payment_method_id: 'pix',
      payer: { email: payerEmail },
    };
  } else if (method === 'credit') {
    if (!card || !card.token) {
      res.status(400).json({ error: 'Missing card token' });
      return;
    }
    payload = {
      transaction_amount: transactionAmount,
      description: description || 'Contribuição via Totem',
      token: card.token,
      installments: Number(card.installments) || 1,
      payment_method_id: card.payment_method_id,
      issuer_id: card.issuer_id,
      payer: {
        email: card.payer?.email || payerEmail,
        identification: card.payer?.identification,
      },
    };
  } else {
    res.status(400).json({ error: 'Invalid payment method' });
    return;
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': `${brandId || 'totem'}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('Mercado Pago payment error:', data);
      res.status(mpRes.status).json({ error: data.message || 'Payment creation failed', details: data });
      return;
    }

    res.status(200).json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (err) {
    console.error('Mercado Pago request failed:', err);
    res.status(500).json({ error: 'Failed to reach Mercado Pago' });
  }
}
