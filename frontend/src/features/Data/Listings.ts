import bgImage from '@assets/images/bg.png';
import sampleimage from '@assets/png-files/imagesample.png';
import everybodyscafe from '@assets/images/everybody-cafe-1.webp';
import everybodyscafe2 from '@assets/images/everybody-cafe-2.png';
import zoobic1 from '@assets/images/zoobic-safari-1.webp';
import zoobic2 from '@assets/images/zoobic-safari-2.jpg';
import alinglucing1 from '@assets/images/aling-lucing-1.jpg';
import alinglucing2 from '@assets/images/aling-lucing-2.webp';
import tsokolateria from '@assets/images/tsokolateria-cafe-1.webp';
import pampangaMusuem1 from '@assets/images/pampanga-musuem-1.jpg';
import pampangaMusuem2 from '@assets/images/pampanga-musuem-2.webp';
import gerryGrill1 from '@assets/images/gerry-grill-1.webp';
import gerryGrill2 from '@assets/images/gerry-grill-2.jpg';

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

export const listings: Listing[] = [
  {
    id: 1,
    name: 'Holy Rosary Parish Church',
    category: 'Activities',
    location: 'Angeles City, Pampanga',
    coordinates: { lat: 15.1450, lng: 120.5887 },
    hours: '6:00 am – 7:00 pm (Daily)',
    description: "One of Pampanga's oldest and most revered churches, the Holy Rosary Parish stands as a testament to the province's deep Catholic heritage and colonial history.",
    images: [bgImage, sampleimage],
    verified: true,
    phone: '+63 928 520 7489',
    facebook: 'facebook.com/hrpacofficial',
  },
  {
    id: 2,
    name: "Everybody's Cafe",
    category: 'Cafe',
    location: 'San Fernando, Pampanga',
    coordinates: { lat: 15.0286, lng: 120.6899 },
    hours: '10:00 am – 9:00 pm (Mon–Sun)',
    description: "A Pampanga institution since 1945, Everybody's Cafe is famous for its traditional Kapampangan dishes and its iconic kare-kare that keeps locals coming back for generations.",
    images: [everybodyscafe, everybodyscafe2],
    verified: true,
    phone: '+63 45 860 1121',
    facebook: 'facebook.com/everybodyscafepampanga',
  },
  {
    id: 3,
    name: 'Zoobic Safari',
    category: 'Activities',
    location: 'Subic Bay Freeport Zone, Pampanga',
    coordinates: { lat: 14.8247, lng: 120.2667 },
    hours: '8:00 am – 5:00 pm (Daily)',
    description: 'Experience thrilling wildlife encounters at Zoobic Safari – home to rare white tigers, exotic animals, and family-friendly adventure activities for all ages.',
    images: [zoobic1, zoobic2],
    verified: true,
    phone: '+63 47 252 6300',
    facebook: 'facebook.com/ZoobicSafari',
    website: 'zoobic.com.ph',
  },
  {
    id: 4,
    name: "Aling Lucing's Restaurant",
    category: 'Resto',
    location: 'Angeles City, Pampanga',
    coordinates: { lat: 15.1453, lng: 120.5869 },
    hours: '10:00 am – 10:00 pm (Tue–Sun)',
    description: "Legendary home of the original sisig, Aling Lucing's is a must-visit Pampanga landmark where the iconic Filipino dish was born and perfected decades ago.",
    images: [alinglucing1, alinglucing2],
    verified: true,
    phone: '+63 906 288 8905',
    facebook: 'facebook.com/lucingcunanan',
    website: 'alinglucing.shop',
  },
  {
    id: 5,
    name: 'Tsokolateria Cafe',
    category: 'Cafe',
    location: 'Pampanga',
    coordinates: { lat: 15.0702, lng: 120.6200 },
    hours: '9:00 am – 9:00 pm (Daily)',
    description: 'A charming artisanal cafe celebrating Filipino cacao culture, offering handcrafted tablea drinks, native pastries, and a cozy ambiance perfect for slow mornings.',
    images: [tsokolateria],
    verified: false,
  },
  {
    id: 6,
    name: 'Pampanga Museum of Art',
    category: 'Activities',
    location: 'San Fernando, Pampanga',
    coordinates: { lat: 15.0291, lng: 120.6914 },
    hours: '9:00 am – 5:00 pm (Tue–Sun)',
    description: "A cultural gem showcasing Kapampangan art, heritage crafts, and rotating exhibitions that celebrate the province's rich artistic identity and creative community.",
    images: [pampangaMusuem1, pampangaMusuem2],
    verified: false,
  },
  {
    id: 7,
    name: "Gerry's Grill Pampanga",
    category: 'Resto',
    location: 'Angeles City, Pampanga',
    coordinates: { lat: 15.1490, lng: 120.5920 },
    hours: '10:00 am – 11:00 pm (Daily)',
    description: "Known for their fresh seafood and Filipino comfort food, Gerry's Grill delivers an authentic local dining experience in a lively, festive atmosphere.",
    images: [gerryGrill1, gerryGrill2],
    verified: true,
  },
];