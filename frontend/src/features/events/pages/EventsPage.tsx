import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Clock, Tag, Ticket } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  artists: string;
  ticket_price: number;
  category: string;
  image_url: string;
  status: string;
}

const CATEGORIES = ['All', 'Concert', 'Market', 'School', 'Festival', 'Sports', 'Other'];

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .order('date', { ascending: true });

    if (!error && data) setEvents(data);
    setLoading(false);
  };

  const filtered = events.filter(e => {
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen w-full bg-[#1A1A1A] text-[#FBFAF8] overflow-hidden">
      {/* Left panel */}
      <div className="w-125 h-full flex flex-col border-r border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h1 className="font-['Playfair_Display'] text-2xl font-bold mb-1">
            Events in <span className="text-[#FFE2A0]">Pampanga</span>
          </h1>
          <p className="text-zinc-500 text-sm mb-4">Discover what's happening around you</p>

          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#2E2E2E] text-sm text-[#FBFAF8] placeholder-zinc-500 px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-[#FFE2A0] mb-4"
          />

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#FFE2A0] text-[#1A1A1A]'
                    : 'bg-[#2E2E2E] text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event list */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
          {loading ? (
            <p className="text-zinc-500 text-sm animate-pulse mt-4">Loading events...</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
              <p className="text-4xl mb-3">🎪</p>
              <p className="font-semibold">No events found</p>
              <p className="text-sm mt-1">Check back later for upcoming events</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {filtered.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`bg-[#2E2E2E] rounded-2xl overflow-hidden cursor-pointer transition-all hover:bg-[#373737] ${
                    selectedEvent?.id === event.id ? 'ring-2 ring-[#FFE2A0]' : ''
                  }`}
                >
                  {event.image_url && (
                    <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold bg-[#FFE2A0]/10 text-[#FFE2A0] px-2 py-1 rounded-lg">
                        {event.category}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {event.ticket_price === 0 ? 'Free' : `₱${event.ticket_price}`}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Calendar size={11} />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                      <MapPin size={11} />
                      <span>{event.venue ?? event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — Event detail */}
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
        {selectedEvent ? (
          <div className="p-8 max-w-2xl">
            {selectedEvent.image_url && (
              <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-72 object-cover rounded-2xl mb-6" />
            )}
            <span className="text-[10px] font-bold bg-[#FFE2A0]/10 text-[#FFE2A0] px-3 py-1.5 rounded-lg">
              {selectedEvent.category}
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl font-bold mt-4 mb-2">{selectedEvent.title}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">{selectedEvent.description}</p>

            <div className="flex flex-col gap-3 bg-[#2E2E2E] rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-[#FFE2A0]" />
                <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-[#FFE2A0]" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-[#FFE2A0]" />
                <span>{selectedEvent.venue}{selectedEvent.location ? `, ${selectedEvent.location}` : ''}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Ticket size={16} className="text-[#FFE2A0]" />
                <span>{selectedEvent.ticket_price === 0 ? 'Free Entry' : `₱${selectedEvent.ticket_price}`}</span>
              </div>
              {selectedEvent.artists && (
                <div className="flex items-center gap-3 text-sm">
                  <Tag size={16} className="text-[#FFE2A0]" />
                  <span>{selectedEvent.artists}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
            <p className="text-5xl mb-3">🎭</p>
            <p className="font-semibold">Select an event to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;