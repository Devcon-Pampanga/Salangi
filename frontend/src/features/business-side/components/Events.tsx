import { useState, useEffect } from "react";
import EventPostModal from "./PostEventModal";
import type { Event } from "../../Data/Events";
import EventCard from "../../dashboard/components/EventCard";
import { supabase } from "../../../lib/supabase";

interface SupabaseEvent {
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
  listing_id: number;
}

export default function Events() {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [userListings, setUserListings] = useState<{id: number, name: string}[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [editingEvent, setEditingEvent] = useState<SupabaseEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: listings } = await supabase
        .from("listings")
        .select("id, name")
        .eq("user_id", user.id);

      if (!listings || listings.length === 0) {
        setLoading(false);
        return;
      }
      setUserListings(listings);

      const targetListingIds = activeFilter === "All"
        ? listings.map(l => l.id)
        : [listings.find(l => l.name === activeFilter)?.id].filter(Boolean) as number[];

      if (targetListingIds.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .in("listing_id", targetListingIds)
        .order("date", { ascending: true });

      if (eventsData) setEvents(eventsData);
    } catch (err) {
      console.error("Events fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeFilter]);

  const handleEdit = (event: SupabaseEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: number) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleAddEvent = (newEvent: SupabaseEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="w-full h-full">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0">
          <div className="mb-4">
            <h1 className="font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide cursor-default">
              Business <span className="text-[#FFE2A0]">Events</span>
            </h1>
            <p className="text-white text-sm">Create and manage your upcoming promotional events</p>
          </div>

          <div className="flex flex-row items-center overflow-x-auto lg:overflow-visible gap-2 bg-[#3a3a3a] p-2 rounded-xl border border-[#4d4d4d] w-full lg:w-fit scrollbar-hide">
            {["All", ...userListings.map(l => l.name)].map((name) => (
              <button
                key={name}
                onClick={() => setActiveFilter(name)}
                className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap relative ${
                  activeFilter === name
                    ? 'bg-[#FFE2A0] text-[#1a1a1a] shadow-md scale-[1.02] z-10 font-semibold'
                    : 'text-white hover:bg-white/5'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-row gap-4 mt-6">
          <button
            onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
            className="p-3 w-54 h-18 rounded-xl flex flex-row items-center gap-3 bg-[#5a5241] hover:bg-[#857657] border border-[#FFE2A0] text-[#fdfdfd] text-md tracking-wide cursor-pointer text-left transition-all shadow-lg active:scale-95"
          >
            <div className="p-3 h-12 w-12 flex justify-center items-center bg-[#474133] rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Post Event</span>
              <span className="text-xs text-[#FFE2A0] opacity-80">Create new event</span>
            </div>
          </button>
        </div>

        {loading ? (
          <p className="text-[#a0a0a0] text-sm mt-12">Loading events...</p>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 mb-8">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  image: event.image_url,
                  organizer: userListings.find(l => l.id === event.listing_id)?.name || "Business"
                } as any}
                isBusinessSide={true}
                onEdit={() => handleEdit(event)}
                onDelete={() => handleDelete(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-4 py-16 mt-4 space-y-4 w-full">
            <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-white text-xl font-semibold tracking-wide font-['Playfair_Display']">No Events Found</h3>
              <p className="text-[#a0a0a0] text-sm font-light max-w-xs mx-auto leading-relaxed">
                Host your first event to reach more customers and grow your community.
              </p>
            </div>
          </div>
        )}

        <EventPostModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddEvent={handleAddEvent}
          editEvent={editingEvent ? {
            ...editingEvent,
            image: editingEvent.image_url,
            organizer: userListings.find(l => l.id === editingEvent.listing_id)?.name || "Business"
          } as Event : null}
        />
      </div>
    </div>
  );
}