// Shared Supabase access via service_role — server-side only, bypasses RLS
// by design. Never import this from client code.

import { decryptCredentials } from './crypto.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminHeaders(extra = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function supabaseAdminFetch(path, options = {}) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Supabase admin credentials not configured');
  }
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: adminHeaders(options.headers),
  });
}

// Server-side tenant validation — a totem's request body is never trusted
// blindly (it has no login, so churchId is just whatever the client sent).
// This closes the "typo'd/garbage/nonexistent tenant creates an orphaned
// record" class. It does NOT prove the request actually came from that
// church's totem — that would need device-level auth, out of scope here.
export async function churchExists(churchId) {
  if (!churchId) return false;
  try {
    const r = await supabaseAdminFetch(`churches?id=eq.${encodeURIComponent(churchId)}&select=id&limit=1`);
    if (!r.ok) return false;
    const rows = await r.json();
    return rows.length > 0;
  } catch (err) {
    console.error('churchExists check failed:', err);
    return false;
  }
}

// Confirms the totem making a financial request actually belongs to the
// church it claims — closes the gap where a real totemId (leaked, guessed,
// or reused from a stale session) could be paired with a different brandId
// to misattribute a contribution to the wrong tenant. churchId is trusted
// only after churchExists() already validated it exists.
export async function totemBelongsToChurch(totemId, churchId) {
  if (!totemId || !churchId) return false;
  try {
    const r = await supabaseAdminFetch(
      `totems?id=eq.${encodeURIComponent(totemId)}&church_id=eq.${encodeURIComponent(churchId)}&select=id&limit=1`
    );
    if (!r.ok) return false;
    const rows = await r.json();
    return rows.length > 0;
  } catch (err) {
    console.error('totemBelongsToChurch check failed:', err);
    return false;
  }
}

// Server-side audit trail for rejected financial requests (no human actor —
// actor_id stays null; the existing audit_logs table already allows that).
// Written with service_role so it's never subject to the totem's own RLS.
export async function recordAuditEvent(fields) {
  try {
    const r = await supabaseAdminFetch('audit_logs', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ actor_email: 'system:totem', ...fields }),
    });
    if (!r.ok) {
      console.error('Failed to record audit event:', r.status, await r.text());
    }
  } catch (err) {
    console.error('Failed to record audit event:', err);
  }
}

// Returns { id, provider, credentials } for the church's active gateway, or
// null if none is configured (caller should fall back to the platform's
// shared Mercado Pago account).
export async function getActiveGateway(churchId) {
  if (!churchId) return null;
  try {
    const res = await supabaseAdminFetch(
      `payment_gateways?church_id=eq.${encodeURIComponent(churchId)}&is_active=eq.true&select=id,provider,credentials_encrypted,credentials_iv,credentials_auth_tag,enabled_methods&limit=1`
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = rows[0];
    if (!row || !row.credentials_encrypted) return null;

    const credentials = decryptCredentials({
      ciphertext: row.credentials_encrypted,
      iv: row.credentials_iv,
      authTag: row.credentials_auth_tag,
    });

    return { id: row.id, provider: row.provider, credentials, enabledMethods: row.enabled_methods || ['pix', 'credit', 'debit'] };
  } catch (err) {
    console.error('Failed to load active payment gateway:', err);
    return null;
  }
}

// Returns { id, provider, instanceName, instanceToken, status } for the
// church's messaging gateway row, or null if none exists yet.
export async function getMessagingGateway(churchId) {
  if (!churchId) return null;
  try {
    const res = await supabaseAdminFetch(
      `messaging_gateways?church_id=eq.${encodeURIComponent(churchId)}&select=id,provider,instance_name,instance_token_encrypted,instance_token_iv,instance_token_auth_tag,status,phone_number,is_active,last_tested_at,last_test_result&limit=1`
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = rows[0];
    if (!row) return null;

    let instanceToken = null;
    if (row.instance_token_encrypted) {
      const decrypted = decryptCredentials({
        ciphertext: row.instance_token_encrypted,
        iv: row.instance_token_iv,
        authTag: row.instance_token_auth_tag,
      });
      instanceToken = decrypted?.token || null;
    }

    return {
      id: row.id,
      provider: row.provider,
      instanceName: row.instance_name,
      instanceToken,
      status: row.status,
      phoneNumber: row.phone_number,
      isActive: row.is_active,
      lastTestedAt: row.last_tested_at,
      lastTestResult: row.last_test_result,
    };
  } catch (err) {
    console.error('Failed to load messaging gateway:', err);
    return null;
  }
}

// Rate limit simples de janela fixa (não é perfeitamente atômico sob rajada
// concorrente extrema, mas é suficiente pra deter abuso real num volume de
// totem/Central admin -- não precisa de Redis/serviço externo novo).
// Retorna true se a chamada é permitida (e já contabiliza), false se
// estourou o limite.
export async function checkRateLimit(key, maxRequests, windowSeconds) {
  try {
    const res = await supabaseAdminFetch(`rate_limits?key=eq.${encodeURIComponent(key)}&select=count,window_start`);
    const rows = res.ok ? await res.json() : [];
    const existing = rows[0];
    const now = Date.now();

    if (!existing || now - new Date(existing.window_start).getTime() > windowSeconds * 1000) {
      await supabaseAdminFetch('rate_limits', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ key, count: 1, window_start: new Date().toISOString() }),
      });
      return true;
    }

    if (existing.count >= maxRequests) return false;

    await supabaseAdminFetch(`rate_limits?key=eq.${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ count: existing.count + 1 }),
    });
    return true;
  } catch (err) {
    console.error('checkRateLimit failed (failing open):', err);
    return true; // uma falha no rate limiter não pode derrubar a funcionalidade real
  }
}

export async function recordContribution(fields) {
  try {
    const r = await supabaseAdminFetch('contributions', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(fields),
    });
    if (!r.ok) {
      console.error('Failed to record contribution:', r.status, await r.text());
    }
  } catch (err) {
    console.error('Failed to record contribution:', err);
  }
}

// Same as recordContribution but returns the inserted row — used where the
// caller needs the new id back (e.g. simulate-debit.js, which has no
// mp_payment_id to key future updates off of).
export async function recordContributionReturning(fields) {
  try {
    const r = await supabaseAdminFetch('contributions', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(fields),
    });
    if (!r.ok) {
      console.error('Failed to record contribution:', r.status, await r.text());
      return null;
    }
    const rows = await r.json();
    return rows[0] || null;
  } catch (err) {
    console.error('Failed to record contribution:', err);
    return null;
  }
}

export async function updateContributionStatus(mpPaymentId, fields) {
  try {
    const r = await supabaseAdminFetch(
      `contributions?mp_payment_id=eq.${encodeURIComponent(mpPaymentId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(fields),
      }
    );
    if (!r.ok) {
      console.error('Failed to update contribution status:', r.status, await r.text());
    }
  } catch (err) {
    console.error('Failed to update contribution status:', err);
  }
}

export async function updateContributionById(id, fields) {
  try {
    const r = await supabaseAdminFetch(`contributions?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(fields),
    });
    if (!r.ok) {
      console.error('Failed to update contribution by id:', r.status, await r.text());
    }
  } catch (err) {
    console.error('Failed to update contribution by id:', err);
  }
}

// Used by create-payment.js to short-circuit a retried/duplicated submit
// (same logical attempt) instead of creating a second charge at the provider.
export async function getContributionByIdempotencyKey(key) {
  if (!key) return null;
  try {
    const r = await supabaseAdminFetch(
      `contributions?idempotency_key=eq.${encodeURIComponent(key)}&select=id,church_id,method,status,mp_payment_id,mp_status_detail&limit=1`
    );
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0] || null;
  } catch (err) {
    console.error('Failed to look up contribution by idempotency key:', err);
    return null;
  }
}

// Used by the webhook handler to find which church a notified payment
// belongs to (the row already exists — create-payment.js writes it before
// Mercado Pago could ever notify about it) and to read-before-write so
// duplicate/out-of-order deliveries never clobber good state.
export async function getContributionByMpPaymentId(mpPaymentId) {
  if (!mpPaymentId) return null;
  try {
    const r = await supabaseAdminFetch(
      `contributions?mp_payment_id=eq.${encodeURIComponent(mpPaymentId)}&select=id,church_id,provider,status,approved_at&limit=1`
    );
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0] || null;
  } catch (err) {
    console.error('Failed to look up contribution by mp_payment_id:', err);
    return null;
  }
}

// Bounded fallback for the webhook handler when the contribution row can't
// be found by mp_payment_id (rare race) — tries each currently-active
// gateway's token until one successfully fetches the payment from Mercado Pago.
export async function listActiveGateways() {
  try {
    const r = await supabaseAdminFetch(
      `payment_gateways?is_active=eq.true&select=church_id,provider,credentials_encrypted,credentials_iv,credentials_auth_tag&limit=25`
    );
    if (!r.ok) return [];
    return await r.json();
  } catch (err) {
    console.error('Failed to list active gateways:', err);
    return [];
  }
}
