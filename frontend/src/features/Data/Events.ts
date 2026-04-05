export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  organizer: string;
}

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "Annual Wine Tasting",
    date: "May 02, 2026",
    time: "6:00 PM - 9:00 PM",
    location: "Central Park Cafe",
    description: "Explore a curated selection of European and local wines. Guided tasting experience with certified sommeliers.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop",
    organizer: "Central Park Cafe"
  }
];
