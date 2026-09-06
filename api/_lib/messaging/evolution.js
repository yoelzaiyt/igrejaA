// Evolution API connector — implements the MessagingProvider contract:
// createInstance(cfg, { instanceName }) -> { instanceToken, qrCodeBase64 }
// getQrCode(cfg, { instanceName }) -> { qrCodeBase64 }
// getConnectionState(cfg, { instanceName }) -> { state: 'open'|'close'|'connecting' }
// sendText(cfg, { instanceName, instanceToken, to, message }) -> { id }
//
// `cfg` = { apiUrl, apiKey } — apiKey here is always the GLOBAL Evolution
// key (instance management). Sending a message uses the per-instance token
// instead, passed explicitly, never the global key — the same separation
// Evolution's own API enforces (see doc: global key manages instances,
// instance token sends messages).

const TIMEOUT_MS = 8000;

function baseHeaders(apiKey) {
  return { apikey: apiKey, 'Content-Type': 'application/json' };
}

// A instância Evolution é um serviço externo self-hosted -- se estiver fora
// do ar ou lenta, isso não pode travar a função serverless até o timeout do
// próprio Vercel. Aborta em 8s e devolve um erro claro em vez de pendurar.
async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Evolution API não respondeu a tempo (instância fora do ar ou muito lenta).'), { status: 504 });
    }
    throw Object.assign(new Error('Não foi possível conectar à Evolution API — verifique se a instância está no ar.'), { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}

async function parseJsonSafely(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function createInstance({ apiUrl, apiKey }, { instanceName }) {
  const res = await fetchWithTimeout(`${apiUrl}/instance/create`, {
    method: 'POST',
    headers: baseHeaders(apiKey),
    body: JSON.stringify({ instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true }),
  });
  const data = await parseJsonSafely(res);
  if (!res.ok) {
    const err = new Error(data?.message || data?.response?.message || 'Falha ao criar instância na Evolution API');
    err.status = res.status;
    throw err;
  }
  return {
    instanceToken: data?.hash?.apikey || data?.hash || null,
    qrCodeBase64: data?.qrcode?.base64 || null,
  };
}

export async function getQrCode({ apiUrl, apiKey }, { instanceName }) {
  const res = await fetchWithTimeout(`${apiUrl}/instance/connect/${encodeURIComponent(instanceName)}`, {
    headers: baseHeaders(apiKey),
  });
  const data = await parseJsonSafely(res);
  if (!res.ok) {
    const err = new Error(data?.message || 'Falha ao obter QR Code da Evolution API');
    err.status = res.status;
    throw err;
  }
  return { qrCodeBase64: data?.base64 || data?.qrcode?.base64 || null };
}

export async function getConnectionState({ apiUrl, apiKey }, { instanceName }) {
  const res = await fetchWithTimeout(`${apiUrl}/instance/connectionState/${encodeURIComponent(instanceName)}`, {
    headers: baseHeaders(apiKey),
  });
  const data = await parseJsonSafely(res);
  if (!res.ok) {
    const err = new Error(data?.message || 'Falha ao consultar status da instância');
    err.status = res.status;
    throw err;
  }
  return { state: data?.instance?.state || 'close' };
}

export async function sendText({ apiUrl }, { instanceName, instanceToken, to, message }) {
  if (!instanceToken) {
    throw Object.assign(new Error('Instância sem token — reconecte o WhatsApp antes de enviar.'), { status: 400 });
  }
  const res = await fetchWithTimeout(`${apiUrl}/message/sendText/${encodeURIComponent(instanceName)}`, {
    method: 'POST',
    headers: baseHeaders(instanceToken),
    body: JSON.stringify({ number: to, text: message }),
  });
  const data = await parseJsonSafely(res);
  if (!res.ok) {
    const err = new Error(data?.message || data?.response?.message?.[0] || 'Falha ao enviar mensagem via Evolution API');
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return { id: data?.key?.id || null };
}

export async function healthCheck({ apiUrl, apiKey }) {
  try {
    const res = await fetchWithTimeout(apiUrl, { headers: baseHeaders(apiKey) });
    return res.status < 500;
  } catch {
    return false;
  }
}
