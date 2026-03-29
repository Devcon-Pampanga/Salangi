import { supabase } from '@/lib/supabase';

export type Category = 'All' | 'Resto' | 'Cafe' | 'Activities';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Listing {
  id: number;
  name: string;
  category: Exclude<Category, 'All'>;
  location: string;
  coordinates: Coordinates;
  hours: string;
  description: string;
  images: string[];
  verified: boolean;
  phone?: string;
  email?: string;
  facebook?: string;
  website?: string;
}

export const CATEGORIES: Record<string, Category> = {
  ALL: 'All',
  RESTO: 'Resto',
  CAFE: 'Cafe',
  ACTIVITIES: 'Activities',
};

function mapRow(row: any): Listing {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    location: row.location,
    coordinates: { lat: row.lat, lng: row.lng },
    hours: row.hours,
    description: row.description,
    images: row.images,
    verified: row.verified,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    facebook: row.facebook ?? undefined,
    website: row.website ?? undefined,
  };
}

export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('verified', true)
    .order('id');
  if (error) throw error;
  return data.map(mapRow);
}

export async function getListingsByCategory(category: Category): Promise<Listing[]> {
  if (category === 'All') return getListings();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('category', category)
    .eq('verified', true)
    .order('id');
  if (error) throw error;
  return data.map(mapRow);
}

export async function getListingById(id: number): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapRow(data);
}

export async function createListing(listing: Omit<Listing, 'id'>): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      name: listing.name,
      category: listing.category,
      location: listing.location,
      lat: listing.coordinates.lat,
      lng: listing.coordinates.lng,
      hours: listing.hours,
      description: listing.description,
      images: listing.images,
      verified: false,
      phone: listing.phone ?? null,
      email: listing.email ?? null,
      facebook: listing.facebook ?? null,
      website: listing.website ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateListing(id: number, updates: Partial<Omit<Listing, 'id'>>): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.category && { category: updates.category }),
      ...(updates.location && { location: updates.location }),
      ...(updates.coordinates && { lat: updates.coordinates.lat, lng: updates.coordinates.lng }),
      ...(updates.hours && { hours: updates.hours }),
      ...(updates.description && { description: updates.description }),
      ...(updates.images && { images: updates.images }),
      ...(updates.verified !== undefined && { verified: updates.verified }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.email !== undefined && { email: updates.email }),
      ...(updates.facebook !== undefined && { facebook: updates.facebook }),
      ...(updates.website !== undefined && { website: updates.website }),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteListing(id: number): Promise<void> {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
};