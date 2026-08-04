import { isSupabaseConfigured, supabase } from './supabase';

export interface TotemRegistration {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  brandId: string;
  date: string;
}

const STORAGE_KEY = 'santuario_registrations';

function readLocalRegistrations(): TotemRegistration[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocalRegistrations(regs: TotemRegistration[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
}

export async function saveRegistration(registration: TotemRegistration): Promise<void> {
  const regs = readLocalRegistrations();
  regs.push(registration);
  writeLocalRegistrations(regs);

  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('registrations').insert({
    id: registration.id,
    name: registration.name,
    phone: registration.phone,
    email: registration.email,
    type: registration.type,
    brand_id: registration.brandId,
    created_at: registration.date,
  });

  if (error) {
    console.error('Failed to save registration to Supabase:', error);
  }
}

export async function fetchRegistrations(): Promise<TotemRegistration[]> {
  if (!isSupabaseConfigured) {
    return readLocalRegistrations();
  }

  const { data, error } = await supabase
    .from('registrations')
    .select('id, name, phone, email, type, brand_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch registrations from Supabase:', error);
    return readLocalRegistrations();
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    type: row.type,
    brandId: row.brand_id,
    date: row.created_at,
  }));
}

export async function deleteRegistration(id: string): Promise<TotemRegistration[]> {
  const updated = readLocalRegistrations().filter((reg) => reg.id !== id);
  writeLocalRegistrations(updated);

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete registration from Supabase:', error);
    }
  }

  return updated;
}

export async function clearRegistrations(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);

  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('registrations').delete().neq('id', '');
  if (error) {
    console.error('Failed to clear registrations in Supabase:', error);
  }
}
