import { supabase } from './supabase';

export interface Contribution {
  id: string;
  churchId: string;
  totemId: string | null;
  category: string;
  method: 'pix' | 'credit' | 'debit';
  provider: string;
  amountCents: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'canceled';
  mpPaymentId: string | null;
  mpStatusDetail: string | null;
  errorDetail: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export async function fetchContributions(): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('id, church_id, totem_id, category, method, provider, amount_cents, status, mp_payment_id, mp_status_detail, error_detail, approved_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Failed to fetch contributions:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    churchId: row.church_id,
    totemId: row.totem_id,
    category: row.category,
    method: row.method,
    provider: row.provider,
    amountCents: row.amount_cents,
    status: row.status,
    mpPaymentId: row.mp_payment_id,
    mpStatusDetail: row.mp_status_detail,
    errorDetail: row.error_detail,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
  }));
}
