import { createClient } from '@supabase/supabase-js';
import type { MapMarker, RescuedPerson } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }
  return supabase;
}

export function isConfigured(): boolean {
  return !!(supabaseUrl && supabaseKey);
}

// ===== AUTH =====
export async function signIn(username: string, password: string) {
  const client = getClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: `${username}@app.local`,
    password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

export async function signOut() {
  const client = getClient();
  await client.auth.signOut();
}

export async function getSession() {
  const client = getClient();
  const { data } = await client.auth.getSession();
  return data.session;
}

// ===== MARKERS =====
type RawMarker = Record<string, unknown>;

function toMapMarker(m: RawMarker): MapMarker {
  return {
    id: m.id as string,
    type: m.type as MapMarker['type'],
    title: m.title as string,
    description: (m.description as string) || '',
    lat: m.lat as number,
    lng: m.lng as number,
    severity: m.severity as MapMarker['severity'] | undefined,
    terrain: m.terrain as MapMarker['terrain'] | undefined,
    groups: (m.groups as MapMarker['groups']) || [],
    supplies: (m.supplies as MapMarker['supplies']) || [],
    isActive: (m.is_active as boolean) ?? true,
    createdAt: m.created_at as string,
    updatedAt: m.updated_at as string,
  };
}

export async function loadMarkersFromDB(): Promise<MapMarker[]> {
  const client = getClient();
  const { data, error } = await client
    .from('markers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as RawMarker[]) || []).map(toMapMarker);
}

export async function saveMarkerToDB(marker: MapMarker): Promise<void> {
  const client = getClient();
  const { error } = await client.from('markers').upsert({
    id: marker.id,
    type: marker.type,
    title: marker.title,
    description: marker.description,
    lat: marker.lat,
    lng: marker.lng,
    severity: marker.severity || null,
    terrain: marker.terrain || null,
    groups: marker.groups || [],
    supplies: marker.supplies || [],
    is_active: marker.isActive ?? true,
    created_at: marker.createdAt,
    updated_at: marker.updatedAt,
  } as never);
  if (error) throw error;
}

export async function deleteMarkerFromDB(id: string): Promise<void> {
  const client = getClient();
  const { error } = await client.from('markers').delete().eq('id', id);
  if (error) throw error;
}

// ===== RESCUED PERSONS =====
type RawPerson = Record<string, unknown>;

function toRescuedPerson(p: RawPerson): RescuedPerson {
  return {
    id: p.id as string,
    name: p.name as string,
    age: p.age as number,
    gender: p.gender as RescuedPerson['gender'],
    zoneId: p.zone_id as string,
    zoneName: p.zone_name as string,
    lat: p.lat as number,
    lng: p.lng as number,
    terrain: p.terrain as RescuedPerson['terrain'] | undefined,
    rescuedAt: p.rescued_at as string,
    rescuedBy: (p.rescued_by as string) || '',
    condition: p.condition as RescuedPerson['condition'],
    notes: (p.notes as string) || '',
    verified: (p.verified as boolean) ?? false,
    verificationUrl: (p.verification_url as string) || '',
    createdAt: p.created_at as string,
  };
}

export async function loadRescuedFromDB(): Promise<RescuedPerson[]> {
  const client = getClient();
  const { data, error } = await client
    .from('rescued_persons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as RawPerson[]) || []).map(toRescuedPerson);
}

export async function saveRescuedToDB(person: RescuedPerson): Promise<void> {
  const client = getClient();
  const { error } = await client.from('rescued_persons').upsert({
    id: person.id,
    name: person.name,
    age: person.age,
    gender: person.gender,
    zone_id: person.zoneId,
    zone_name: person.zoneName,
    lat: person.lat,
    lng: person.lng,
    terrain: person.terrain || null,
    rescued_at: person.rescuedAt,
    rescued_by: person.rescuedBy || null,
    condition: person.condition,
    notes: person.notes || null,
    verified: person.verified,
    verification_url: person.verificationUrl || null,
    created_at: person.createdAt,
  } as never);
  if (error) throw error;
}
