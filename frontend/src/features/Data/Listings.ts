// listings.js — Central data store for all business listings
// Replace placeholder image URLs with real ones when available

// Listings.ts — Central data store for all business listings

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
  image: string;
  verified: boolean;
}

export const CATEGORIES: Record<string, Category> = {
  ALL: 'All',
  RESTO: 'Resto',
  CAFE: 'Cafe',
  ACTIVITIES: 'Activities',
};

export const listings: Listing[] = [
  {
    id: 1,
    name: 'Holy Rosary Parish Church',
    category: 'Activities',
    location: 'Angeles City, Pampanga',
    coordinates: { lat: 15.1450, lng: 120.5887 },
    hours: '6:00 am – 7:00 pm (Daily)',
    description:
      "One of Pampanga's oldest and most revered churches, the Holy Rosary Parish stands as a testament to the province's deep Catholic heritage and colonial history.",
    image: 'https://images.unsplash.com/photo-1548625149-720754864788?w=600&q=80',
    verified: true,
  },
  {
    id: 2,
    name: "Everybody's Cafe",
    category: 'Cafe',
    location: 'San Fernando, Pampanga',
    coordinates: { lat: 15.0286, lng: 120.6899 },
    hours: '10:00 am – 9:00 pm (Mon–Sun)',
    description:
      "A Pampanga institution since 1945, Everybody's Cafe is famous for its traditional Kapampangan dishes and its iconic kare-kare that keeps locals coming back for generations.",
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
    verified: true,
  },
  {
    id: 3,
    name: 'Zoobic Safari',
    category: 'Activities',
    location: 'Subic Bay Freeport Zone, Pampanga',
    coordinates: { lat: 14.8247, lng: 120.2667 },
    hours: '8:00 am – 5:00 pm (Daily)',
    description:
      'Experience thrilling wildlife encounters at Zoobic Safari — home to rare white tigers, exotic animals, and family-friendly adventure activities for all ages.',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80',
    verified: true,
  },
  {
    id: 4,
    name: "Aling Lucing's Restaurant",
    category: 'Resto',
    location: 'Angeles City, Pampanga',
    coordinates: { lat: 15.1453, lng: 120.5869 },
    hours: '10:00 am – 10:00 pm (Tue–Sun)',
    description:
      "Legendary home of the original sisig, Aling Lucing's is a must-visit Pampanga landmark where the iconic Filipino dish was born and perfected decades ago.",
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    verified: true,
  },
  {
    id: 5,
    name: 'Tsokolateria Cafe',
    category: 'Cafe',
    location: 'Pampanga',
    coordinates: { lat: 15.0702, lng: 120.6200 },
    hours: '9:00 am – 9:00 pm (Daily)',
    description:
      'A charming artisanal cafe celebrating Filipino cacao culture, offering handcrafted tablea drinks, native pastries, and a cozy ambiance perfect for slow mornings.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    verified: false,
  },
  {
    id: 6,
    name: 'Pampanga Museum of Art',
    category: 'Activities',
    location: 'San Fernando, Pampanga',
    coordinates: { lat: 15.0291, lng: 120.6914 },
    hours: '9:00 am – 5:00 pm (Tue–Sun)',
    description:
      "A cultural gem showcasing Kapampangan art, heritage crafts, and rotating exhibitions that celebrate the province's rich artistic identity and creative community.",
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&q=80',
    verified: false,
  },
  {
    id: 7,
    name: "Gerry's Grill Pampanga",
    category: 'Resto',
    location: 'Angeles City, Pampanga',
    coordinates: { lat: 15.1490, lng: 120.5920 },
    hours: '10:00 am – 11:00 pm (Daily)',
    description:
      "Known for their fresh seafood and Filipino comfort food, Gerry's Grill delivers an authentic local dining experience in a lively, festive atmosphere.",
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    verified: true,
  },
];