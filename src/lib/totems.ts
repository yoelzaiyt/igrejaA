import { supabase } from './supabase';

// id -> label lookup for the admin panel's "por totem" breakdown. Mirrors
// the allBrandsRaw id->name pattern already used in AdminView.tsx for church
// names — same shape, same convention. Omit churchId (master viewing every
// church's contributions at once) to fetch every totem's label.
export async function fetchTotemsMap(churchId?: string): Promise<Record<string, string>> {
  let query = supabase.from('totems').select('id, label');
  if (churchId) query = query.eq('church_id', churchId);
  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch totems:', error);
    return {};
  }

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.id] = row.label;
  }
  return map;
}
