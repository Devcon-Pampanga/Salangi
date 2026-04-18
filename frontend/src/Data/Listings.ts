import { supabase } from '@/lib/supabase';

export type Category = 'All' | 'Food & Drinks' | 'Shops' | 'Activities' | 'Services' | 'Stay' | 'Community & Essentials';

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
  FOOD: 'Food & Drinks',
  SHOPS: 'Shops',
  ACTIVITIES: 'Activities',
  SERVICES: 'Services',
  STAY: 'Stay',
  COMMUNITY: 'Community & Essentials',
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
}

export async function getAverageRatings(): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('reviews')
    .select('listing_id, rating');

  if (error) throw error;

  const ratingsMap: Record<number, number[]> = {};
  data.forEach((row: any) => {
    if (!ratingsMap[row.listing_id]) ratingsMap[row.listing_id] = [];
    ratingsMap[row.listing_id].push(row.rating);
  });

  const averages: Record<number, number> = {};
  Object.entries(ratingsMap).forEach(([id, ratings]) => {
    averages[Number(id)] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  });

  return averages;
}

// ── Surprise Me ───────────────────────────────────────────────────────────────
//
// Picks a random "hidden gem" from verified listings.
//
// Logic:
//   1. Fetch all verified listings
//   2. Exclude listings the current user already saved
//   3. Prefer listings with avg rating >= 4.0 (falls back to any if none qualify)
//   4. Pick one at random

export async function getSurpriseListing(
  userId: string | null
): Promise<Listing | null> {

  const { data: listingsData, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('verified', true);

  if (listingsError || !listingsData || listingsData.length === 0) return null;

  const allListings: Listing[] = listingsData.map(mapRow);

  // Fetch the user's saved IDs (skip if not logged in)
  let savedIds: number[] = [];
  if (userId) {
    const { data: savesData } = await supabase
      .from('saves')
      .select('listing_id')
      .eq('user_id', userId);

    if (savesData) {
      savedIds = savesData.map((row: any) => row.listing_id);
    }
  }

  // Exclude already-saved listings; fall back to full list if user saved everything
  const unsaved = allListings.filter(l => !savedIds.includes(l.id));
  const pool = unsaved.length > 0 ? unsaved : allListings;

  // Fetch ratings scoped to only the candidate pool
  const poolIds = pool.map(l => l.id);
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('listing_id, rating')
    .in('listing_id', poolIds);

  const ratingsMap: Record<number, number[]> = {};
  (reviewsData ?? []).forEach((row: any) => {
    if (!ratingsMap[row.listing_id]) ratingsMap[row.listing_id] = [];
    ratingsMap[row.listing_id].push(row.rating);
  });

  const avgRating = (id: number): number => {
    const ratings = ratingsMap[id];
    if (!ratings || ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  // Prefer high-rated listings; fall back to full pool if none qualify
  const highRated = pool.filter(l => avgRating(l.id) >= 4.0);
  const candidates = highRated.length > 0 ? highRated : pool;

  // Pick one at random
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return pick ?? null;
}