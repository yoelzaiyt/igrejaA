// Lightweight per-kiosk device identity — enough to populate
// contributions.totem_id and power the admin panel's "por totem" filter,
// without building the full totems/device_logs management feature.
//
// Label resolution mirrors the ?client= pattern already used for brand
// identity in utils/brand.ts: ?totem= always wins (lets an admin assign a
// human-readable label by editing the kiosk's bookmarked URL), else a
// label cached in localStorage, else a freshly generated one cached for
// next time. Resolving that label to a totems.id row never throws — a
// totem-identity hiccup must never block a donation.

const LABEL_KEY = 'santuario_totem_label';

export function getTotemLabel(): string {
  if (typeof window === 'undefined') return 'unknown';

  const params = new URLSearchParams(window.location.search);
  const explicit = params.get('totem');
  if (explicit && explicit.trim()) {
    const label = explicit.trim().toLowerCase();
    try {
      localStorage.setItem(LABEL_KEY, label);
    } catch {
      // ignore
    }
    return label;
  }

  try {
    const stored = localStorage.getItem(LABEL_KEY);
    if (stored) return stored;
  } catch {
    // ignore
  }

  const generated = `totem-${Math.random().toString(36).slice(2, 10)}`;
  try {
    localStorage.setItem(LABEL_KEY, generated);
  } catch {
    // ignore
  }
  return generated;
}

function idCacheKey(brandId: string, label: string): string {
  return `santuario_totem_id_${brandId}_${label}`;
}

export async function getOrResolveTotemId(brandId: string): Promise<string | null> {
  const label = getTotemLabel();

  try {
    const cached = localStorage.getItem(idCacheKey(brandId, label));
    if (cached) return cached;
  } catch {
    // ignore
  }

  try {
    const res = await fetch('/api/resolve-totem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ churchId: brandId, label }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.id) return null;
    try {
      localStorage.setItem(idCacheKey(brandId, label), data.id);
    } catch {
      // ignore
    }
    return data.id;
  } catch {
    return null;
  }
}
