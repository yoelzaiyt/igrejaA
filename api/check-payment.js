// Vercel Serverless Function — polls a Mercado Pago payment's current status.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'MERCADOPAGO_ACCESS_TOKEN not configured' });
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Missing payment id' });
    return;
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await mpRes.json();

    if (!mpRes.ok) {
      res.status(mpRes.status).json({ error: data.message || 'Failed to fetch payment' });
      return;
    }

    res.status(200).json({ id: data.id, status: data.status, status_detail: data.status_detail });
  } catch (err) {
    console.error('Mercado Pago status check failed:', err);
    res.status(500).json({ error: 'Failed to reach Mercado Pago' });
  }
}
