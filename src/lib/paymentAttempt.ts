// Tracks one "attempt to pay" (category+value+method) across the PIX/card
// steps of DonationView. Persisted to sessionStorage so a totem refresh
// resumes the same attempt (same mpPaymentId/QR, same idempotency key)
// instead of silently minting a second charge. Deliberately sessionStorage,
// not localStorage: it must survive an F5 but must NOT resurrect a stale
// attempt days later if the kiosk browser is simply reopened.

const STORAGE_KEY = 'donation_attempt_v1';
const MAX_ATTEMPT_AGE_MS = 15 * 60 * 1000; // beyond this the PIX would have expired anyway

// A totem's browser tab typically stays open for many different shoppers in
// a row without ever reloading — sessionStorage alone can't tell "this same
// shopper hit F5" apart from "a new shopper just opened Doações 10 minutes
// after the last one walked away". This in-memory flag resets to false only
// on an actual page (re)load (module state is wiped then) and flips to true
// on the very first check afterwards — so a resumed attempt can only ever
// surface once per real reload, exactly the F5 case this exists for, and
// never leaks into a later shopper's fresh session within the same tab.
let resumeCheckedThisPageLoad = false;

export interface PaymentAttempt {
  attemptId: string;
  idempotencyKey: string;
  brandId: string;
  category: string;
  value: number;
  method: 'pix' | 'credit' | 'debit';
  step: 'pix' | 'mp_card' | 'card';
  mpPaymentId?: string | number;
  mpQrCode?: string;
  mpQrCodeBase64?: string;
  createdAt: number;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function startAttempt(params: {
  brandId: string;
  category: string;
  value: number;
  method: 'pix' | 'credit' | 'debit';
  step: 'pix' | 'mp_card' | 'card';
}): PaymentAttempt {
  const attempt: PaymentAttempt = {
    attemptId: newId(),
    idempotencyKey: newId(),
    createdAt: Date.now(),
    ...params,
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
  } catch {
    // storage disabled (private mode, etc.) — attempt just won't survive a refresh
  }
  return attempt;
}

export function getOpenAttempt(brandId: string): PaymentAttempt | null {
  if (resumeCheckedThisPageLoad) return null;
  resumeCheckedThisPageLoad = true;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const attempt = JSON.parse(raw) as PaymentAttempt;
    if (attempt.brandId !== brandId) return null;
    if (Date.now() - attempt.createdAt > MAX_ATTEMPT_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return attempt;
  } catch {
    return null;
  }
}

export function updateAttempt(patch: Partial<PaymentAttempt>): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const attempt = { ...JSON.parse(raw), ...patch };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
  } catch {
    // ignore
  }
}

export function clearAttempt(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
