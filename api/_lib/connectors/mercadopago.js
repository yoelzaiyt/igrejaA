// Mercado Pago connector — implements the common payment connector contract:
// createPayment(accessToken, params) -> { id, status, status_detail, qr_code?, qr_code_base64? }
// checkStatus(accessToken, paymentId) -> { id, status, status_detail }

export async function createPayment(accessToken, { method, transactionAmount, description, brandId, card, idempotencyKey, notificationUrl }) {
  const payerEmail = `doador-${(brandId || 'totem').toLowerCase().replace(/[^a-z0-9]/g, '')}@santuariodigital.app`;

  let payload;
  if (method === 'pix') {
    payload = {
      transaction_amount: transactionAmount,
      description: description || 'Contribuição via Totem',
      payment_method_id: 'pix',
      // O totem não coleta nome/CPF do doador (fluxo anônimo, de propósito —
      // não vamos inventar um CPF real). first_name/last_name/external_reference
      // são os campos documentados que dá pra preencher honestamente, e ajudam
      // a rastrear a cobrança no painel do Mercado Pago por igreja/tentativa.
      payer: { email: payerEmail, first_name: 'Doador', last_name: brandId || 'Totem' },
      external_reference: idempotencyKey || undefined,
      // Keeps Mercado Pago's own expiration in sync with the UI's 5-minute
      // countdown — without this the QR technically stays payable forever
      // on MP's side, and MP never has anything to webhook about an
      // abandoned/expired PIX.
      date_of_expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  } else if (method === 'credit') {
    if (!card || !card.token) {
      throw Object.assign(new Error('Missing card token'), { status: 400 });
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
    throw Object.assign(new Error('Invalid payment method'), { status: 400 });
  }

  if (notificationUrl) {
    payload.notification_url = notificationUrl;
  }

  const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      // Reuses the caller's per-attempt idempotency key so a retried/duplicated
      // request for the SAME logical attempt never creates a second charge at
      // Mercado Pago. Falls back to a generated key only if none was passed.
      'X-Idempotency-Key': idempotencyKey || `${brandId || 'totem'}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await mpRes.json();

  if (!mpRes.ok) {
    const err = new Error(data.message || 'Payment creation failed');
    err.status = mpRes.status;
    err.details = data;
    throw err;
  }

  return {
    id: data.id,
    status: data.status,
    status_detail: data.status_detail,
    qr_code: data.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
  };
}

export async function checkStatus(accessToken, paymentId) {
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await mpRes.json();

  if (!mpRes.ok) {
    const err = new Error(data.message || 'Failed to fetch payment');
    err.status = mpRes.status;
    throw err;
  }

  return { id: data.id, status: data.status, status_detail: data.status_detail };
}

// Explicit cancel — called when the shopper taps "Cancelar" on a still-open
// PIX, so the ledger reflects `canceled` immediately instead of waiting up
// to 5 minutes for Mercado Pago's own expiration to eventually webhook it.
export async function cancelPayment(accessToken, paymentId) {
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  const data = await mpRes.json();
  if (!mpRes.ok) {
    const err = new Error(data.message || 'Failed to cancel payment');
    err.status = mpRes.status;
    throw err;
  }
  return { id: data.id, status: data.status, status_detail: data.status_detail };
}

// Lightweight read-only call used by the "Testar Conexão" button — confirms
// the access token is valid without charging anything.
export async function testConnection(accessToken) {
  const res = await fetch('https://api.mercadopago.com/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Falha na conexão (HTTP ${res.status})`);
  }
  const data = await res.json();
  return { accountId: data.id, nickname: data.nickname };
}
