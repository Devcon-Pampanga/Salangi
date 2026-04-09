import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import EventCard from '../components/EventCard';
import { Search } from 'lucide-react';

interface PublicEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  date_range: string;
  time: string;
  location: string;
  image_url: string;
  verified: boolean;
  status?: string;
  listing_id: number | null;
  organizer?: string;
  interest_count?: number;
}

const FILTERS = ['All', 'Today', 'This Week', 'This Month'];

function Eventspage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // ✅ FIX: Fetch events that are either verified=true OR status='approved'
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*, listings(name)')
          .or('verified.eq.true,status.eq.approved')
          .order('created_at', { ascending: false });

        if (error) console.error('Supabase error:', error);

        if (eventsData) {
          // Fetch interest counts for all events
          const eventIds = eventsData.map((e: any) => e.id);
          const { data: interestData } = await supabase
            .from('event_interests')
            .select('event_id')
            .in('event_id', eventIds);

          // Build a count map
          const interestMap: Record<number, number> = {};
          (interestData ?? []).forEach((row: any) => {
            interestMap[row.event_id] = (interestMap[row.event_id] ?? 0) + 1;
          });

          const formatted = eventsData.map((e: any) => ({
            ...e,
            image: e.image_url,
            date: e.date_range || e.date,
            organizer: e.listings?.name ?? 'Local Organizer',
            interest_count: interestMap[e.id] ?? 0,
          }));
          setEvents(formatted);
        }
      } catch (err) {
        console.error('Events fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.location ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.organizer ?? '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeFilter === 'All') return true;

      const rawDate = (e as any).date_raw ?? todayStr;
      if (activeFilter === 'Today') return rawDate === todayStr;
      if (activeFilter === 'This Week') return rawDate <= endOfWeek.toISOString().split('T')[0];
      if (activeFilter === 'This Month') return rawDate <= endOfMonth.toISOString().split('T')[0];
      return true;
    });
  }, [events, searchQuery, activeFilter]);

  return (
    <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">

      {/* Radial glow */}
      <div
        className="absolute top-0 left-0 rounded-full blur-3xl opacity-60 pointer-events-none hidden md:block"
        style={{
          width: '760px',
          height: '680px',
          transform: 'translate(-400px, -440px)',
          background: 'radial-gradient(circle, rgba(255,226,160,0.8) 0%, rgba(255,226,160,0.2) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 h-full flex flex-col px-4 py-4 md:px-6 md:py-6 overflow-y-auto no-scrollbar">

        {/* Header */}
        <div className="shrink-0 mb-6">
          <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl leading-tight mb-1">
            Upcoming <span className="text-[#FFE2A0]">Events</span>
          </h1>
          <p className="text-[#FBFAF8]/50 text-sm">Discover what's happening around Pampanga.</p>
        </div>

        {/* Search + Filters */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FBFAF8]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, venues..."
              className="w-full bg-[#2E2E2E] text-[#FBFAF8] placeholder-[#FBFAF8]/30 pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#FFE2A0]/50 transition-all border border-transparent focus:border-[#FFE2A0]/20"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#2E2E2E] p-1.5 rounded-xl border border-[#3a3a3a] overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeFilter === f
                    ? 'bg-[#FFE2A0] text-[#1a1a1a] font-semibold shadow-sm'
                    : 'text-[#FBFAF8]/60 hover:text-[#FBFAF8] hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="animate-spin h-6 w-6 mb-4 text-[#FFE2A0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-[#FBFAF8]/40 text-sm animate-pulse">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <p className="text-[#FBFAF8]/30 text-xs mb-4 shrink-0">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-10">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    image: event.image_url,
                    interest_count: event.interest_count ?? 0,
                  } as any}
                  isBusinessSide={false}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="bg-[#2E2E2E] p-5 rounded-full border border-[#3a3a3a]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="size-10 text-[#FFE2A0]/60">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#FBFAF8]/80 font-semibold text-lg font-['Playfair_Display']">No Events Found</h3>
              <p className="text-[#FBFAF8]/40 text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? `No events matching "${searchQuery}".`
                  : 'No upcoming events right now. Check back soon!'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#FFE2A0] text-xs hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Eventspage;
