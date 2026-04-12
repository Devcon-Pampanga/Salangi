import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Heart, X, MapPin, Clock, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink, Link2 } from 'lucide-react';
import type { Event } from '../../Data/Events';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import locBtnSelected from '@assets/icons/map-btn-active.svg';
import timeIcon from '@assets/icons/time-btn.svg';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

interface EventCardProps {
  event: Event & { interest_count?: number; images?: string[]; lat?: number | null; lng?: number | null };
  isBusinessSide?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (id: number) => void;
}

function formatDate(raw: string | undefined | null): string {
  if (!raw) return '';
  if (isNaN(Date.parse(raw))) return raw;
  return new Date(raw.includes('T') ? raw : raw + 'T12:00:00').toLocaleDateString('default', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function getLinkIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('facebook') || lower.includes('fb')) return '📘';
  if (lower.includes('instagram') || lower.includes('ig'))  return '📸';
  if (lower.includes('register') || lower.includes('form')) return '📋';
  if (lower.includes('ticket'))                              return '🎟️';
  if (lower.includes('website') || lower.includes('web'))   return '🌐';
  if (lower.includes('youtube') || lower.includes('video')) return '▶️';
  if (lower.includes('twitter') || lower.includes('x.com')) return '🐦';
  return '🔗';
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView([lat, lng], 16);
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    L.marker([lat, lng]).addTo(map);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [lat, lng]);

  return <div ref={mapRef} style={{ height: '160px', width: '100%', borderRadius: '10px', overflow: 'hidden' }} />;
}

function EventCard({ event, isBusinessSide, onEdit, onDelete }: EventCardProps) {
  const [isInterested, setIsInterested]     = useState(false);
  const [interestCount, setInterestCount]   = useState(event.interest_count ?? 0);
  const [loading, setLoading]               = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [carouselIndex, setCarouselIndex]   = useState(0);
  const [modalCarouselIndex, setModalCarouselIndex] = useState(0);

  const allImages: string[] = ((event as any).images?.length
    ? (event as any).images
    : (event.image ? [event.image] : [])).filter(Boolean);

  const coverImage  = allImages[0] ?? event.image ?? '';
  const displayDate = formatDate(event.date);

  // Links — filter out any with missing URL
  const links: { label: string; url: string; isPrimary?: boolean }[] =
    ((event as any).links ?? []).filter((l: any) => l.url && l.label);
  const primaryLinks = links.filter((l) => l.isPrimary);
  const otherLinks   = links.filter((l) => !l.isPrimary);

  useEffect(() => {
    if (isBusinessSide) return;
    const checkInterest = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('event_interests').select('id').eq('event_id', event.id).eq('user_id', user.id).maybeSingle();
      setIsInterested(!!data);
    };
    const fetchCount = async () => {
      const { count } = await supabase.from('event_interests').select('*', { count: 'exact', head: true }).eq('event_id', event.id);
      setInterestCount(count ?? 0);
    };
    checkInterest();
    fetchCount();
  }, [event.id, isBusinessSide]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      setModalCarouselIndex(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleInterested = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      if (isInterested) {
        const { error } = await supabase.from('event_interests').delete().eq('event_id', event.id).eq('user_id', user.id);
        if (!error) { setIsInterested(false); setInterestCount(prev => Math.max(0, prev - 1)); }
      } else {
        const { error } = await supabase.from('event_interests').insert({ event_id: event.id, user_id: user.id });
        if (!error) { setIsInterested(true); setInterestCount(prev => prev + 1); }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasMap = typeof (event as any).lat === 'number' && typeof (event as any).lng === 'number';

  const modal = showModal ? createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="relative w-full max-w-lg bg-[#2a2a2a] rounded-2xl overflow-hidden border border-zinc-700/50 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image carousel */}
        <div className="relative h-64 w-full shrink-0 bg-[#222222]">
          {allImages.length > 0 ? (
            <>
              <img src={allImages[modalCarouselIndex] ?? coverImage} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#2a2a2a] text-[#FBFAF8]/10">
              <ImageIcon size={48} strokeWidth={1} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">No Event Image</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] via-transparent to-transparent" />
            </div>
          )}

          {/* Close */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 transition-all hover:scale-110 active:scale-95"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Carousel controls */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setModalCarouselIndex(i => (i - 1 + allImages.length) % allImages.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full border border-white/10 transition-all"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setModalCarouselIndex(i => (i + 1) % allImages.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full border border-white/10 transition-all"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
              <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-1.5">
                {allImages.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setModalCarouselIndex(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === modalCarouselIndex ? 'bg-[#FFE2A0] w-3' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Date badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#FFE2A0]/90 backdrop-blur-md rounded-full shadow-lg">
            <span className="text-[#222222] text-[10px] font-black tracking-wider uppercase">{displayDate}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div>
            <h2 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl leading-tight mb-1">{event.title}</h2>
            <span className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest opacity-80">{event.organizer}</span>
          </div>

          <div className="border-t border-white/10" />

          <p className="text-sm text-[#FBFAF8]/70 leading-relaxed">{event.description}</p>

          {/* Info rows */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3a3a3a] flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[#FFE2A0]" />
              </div>
              <div>
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Location</p>
                <p className="text-[#FBFAF8] text-sm font-medium">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3a3a3a] flex items-center justify-center shrink-0">
                <Clock size={14} className="text-[#FFE2A0]" />
              </div>
              <div>
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Time</p>
                <p className="text-[#FBFAF8] text-sm font-medium">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3a3a3a] flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-[#FFE2A0]" />
              </div>
              <div>
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Date</p>
                <p className="text-[#FBFAF8] text-sm font-medium">{displayDate}</p>
              </div>
            </div>
          </div>

          {/* ── EVENT LINKS SECTION ── */}
          {links.length > 0 && (
            <div>
              <div className="border-t border-white/10 mb-4" />
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={13} className="text-[#FFE2A0]" />
                <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold">Event Links</p>
              </div>

              <div className="flex flex-col gap-2">
                {/* Primary links first — larger, highlighted */}
                {primaryLinks.map((link, i) => (
                  <a
                    key={`primary-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
                    style={{
                      backgroundColor: 'rgba(255,226,160,0.1)',
                      border: '1px solid rgba(255,226,160,0.25)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,226,160,0.18)';
                      e.currentTarget.style.borderColor = 'rgba(255,226,160,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,226,160,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,226,160,0.25)';
                    }}
                  >
                    <span className="text-base shrink-0">{getLinkIcon(link.label)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#FFE2A0] truncate">{link.label}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0"
                          style={{ backgroundColor: 'rgba(255,226,160,0.2)', color: '#FFE2A0' }}>
                          KEY
                        </span>
                      </div>
                      <p className="text-[10px] text-[#FBFAF8]/30 truncate mt-0.5">{link.url}</p>
                    </div>
                    <ExternalLink size={14} className="text-[#FFE2A0] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}

                {/* Other links */}
                {otherLinks.map((link, i) => (
                  <a
                    key={`other-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                    style={{ backgroundColor: '#333333', border: '1px solid #3d3d3d' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3a3a3a';
                      e.currentTarget.style.borderColor = '#555555';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#333333';
                      e.currentTarget.style.borderColor = '#3d3d3d';
                    }}
                  >
                    <span className="text-base shrink-0">{getLinkIcon(link.label)}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#FBFAF8] truncate block">{link.label}</span>
                      <p className="text-[10px] text-[#FBFAF8]/30 truncate mt-0.5">{link.url}</p>
                    </div>
                    <ExternalLink size={13} className="text-[#FBFAF8]/30 shrink-0 group-hover:text-[#FFE2A0] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* ── END LINKS ── */}

          {/* Mini Map */}
          {hasMap && (
            <div>
              <div className="border-t border-white/10 mb-4" />
              <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold mb-2">Map</p>
              <MiniMap lat={(event as any).lat} lng={(event as any).lng} />
              <a
                href={`https://www.openstreetmap.org/?mlat=${(event as any).lat}&mlon=${(event as any).lng}&zoom=17`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 mt-2 text-[#FFE2A0] text-xs hover:underline"
              >
                <MapPin size={11} /> Open in Maps
              </a>
            </div>
          )}

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div>
              <p className="text-[#FBFAF8]/40 text-[10px] uppercase tracking-wider font-semibold mb-2">Photos</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {allImages.map((src, i) => (
                  <button key={i} onClick={() => setModalCarouselIndex(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === modalCarouselIndex ? 'border-[#FFE2A0]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer actions */}
          {!isBusinessSide ? (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[#FBFAF8]/40">
                <Heart size={13} className={isInterested ? 'fill-[#FFE2A0] text-[#FFE2A0]' : ''} />
                <span className="text-xs">{interestCount} interested</span>
              </div>
              <button
                onClick={(e) => handleInterested(e)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-60 ${
                  isInterested ? 'bg-[#FFE2A0] text-[#222222] hover:bg-[#f5d880]' : 'bg-[#454545] text-[#FBFAF8] hover:bg-[#525252] border border-white/5'
                }`}
              >
                <Heart size={14} className={isInterested ? 'fill-[#222222] text-[#222222]' : 'text-[#FFE2A0]'} />
                <span>{isInterested ? 'Interested!' : 'Interested'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowModal(false); onEdit?.(event); }}
              className="w-full py-3.5 bg-[#454545] text-white text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer shadow-lg border border-white/5"
            >
              Edit Event
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* ── Card ── */}
      <div
        className="w-full max-w-md bg-[#333333] rounded-xl overflow-hidden border border-zinc-800/50 hover:bg-[#3d3d3d] transition-all duration-200 cursor-pointer flex flex-col h-full"
        onClick={() => setShowModal(true)}
      >
        {/* Image */}
        <div className="relative group h-72 bg-[#2a2a2a]">
          {allImages.length > 0 ? (
            <img
              src={allImages[carouselIndex] ?? coverImage}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#2a2a2a] text-[#FBFAF8]/20 group-hover:bg-[#2d2d2d] transition-colors">
              <ImageIcon size={40} strokeWidth={1} />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold">No Image Available</span>
            </div>
          )}

          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setCarouselIndex(i => (i - 1 + allImages.length) % allImages.length); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/50 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-20">
                <ChevronLeft size={14} className="text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCarouselIndex(i => (i + 1) % allImages.length); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/50 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-20">
                <ChevronRight size={14} className="text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {carouselIndex + 1}/{allImages.length}
              </div>
            </>
          )}

          {/* Date badge */}
          <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-[#FFE2A0]/90 backdrop-blur-md rounded-full z-20 shadow-lg">
            <span className="text-[#222222] text-[9px] font-black tracking-wider uppercase">{displayDate}</span>
          </div>

          {isBusinessSide && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(event.id); }}
              className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 bg-red-600/90 hover:bg-red-700 backdrop-blur-md rounded-full z-30 cursor-pointer shadow-xl border border-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Trash2 size={18} className="text-white" />
            </button>
          )}

          {isBusinessSide && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <Heart size={12} className="text-[#FFE2A0] fill-[#FFE2A0]" />
              <span className="text-[#FFE2A0] text-xs font-bold">{interestCount}</span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex flex-col mb-4">
            <h3 className="text-[#FBFAF8] font-['Playfair_Display'] font-bold text-2xl tracking-tight leading-tight">{event.title}</h3>
            <span className="text-[#FFE2A0] text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">{event.organizer}</span>
          </div>

          <p className="text-sm text-[#FBFAF8]/70 leading-relaxed line-clamp-2 mb-4 h-10">{event.description}</p>

          {/* Info row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
            <div className="flex items-center gap-2">
              <img src={locBtnSelected} width="14" alt="location" className="opacity-70" />
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={timeIcon} width="14" alt="hours" className="opacity-70" />
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#FBFAF8]/50 shrink-0" />
              <span className="text-[#FBFAF8]/50 text-xs font-medium">{displayDate}</span>
            </div>
          </div>

          {/* Primary link preview on card (if any) */}
          {primaryLinks.length > 0 && (
            <a
              href={primaryLinks[0].url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 transition-all duration-200 group"
              style={{ backgroundColor: 'rgba(255,226,160,0.08)', border: '1px solid rgba(255,226,160,0.2)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,226,160,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,226,160,0.08)'}
            >
              <span className="text-sm">{getLinkIcon(primaryLinks[0].label)}</span>
              <span className="text-xs font-semibold text-[#FFE2A0] flex-1 truncate">{primaryLinks[0].label}</span>
              <ExternalLink size={11} className="text-[#FFE2A0] opacity-60 group-hover:opacity-100 shrink-0 transition-opacity" />
            </a>
          )}

          {/* Links count indicator (if more than just the primary preview) */}
          {links.length > (primaryLinks.length > 0 ? 1 : 0) && (
            <div className="flex items-center gap-1.5 mb-4">
              <Link2 size={11} className="text-[#FBFAF8]/30" />
              <span className="text-[10px] text-[#FBFAF8]/30">
                {links.length} link{links.length !== 1 ? 's' : ''} — tap to view
              </span>
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            {isBusinessSide ? (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(event); }}
                className="w-full py-3.5 bg-[#454545] text-white text-xs font-bold rounded-xl hover:bg-[#525252] transition-all active:scale-95 cursor-pointer shadow-lg border border-white/5"
              >
                Edit Event
              </button>
            ) : (
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#FBFAF8]/40">
                  <Heart size={13} className={isInterested ? 'fill-[#FFE2A0] text-[#FFE2A0]' : ''} />
                  <span className="text-xs">{interestCount} interested</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleInterested(e); }}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg disabled:opacity-60 ${
                    isInterested ? 'bg-[#FFE2A0] text-[#222222] hover:bg-[#f5d880]' : 'bg-[#454545] text-[#FBFAF8] hover:bg-[#525252] border border-white/5'
                  }`}
                >
                  <Heart size={14} className={isInterested ? 'fill-[#222222] text-[#222222]' : 'text-[#FFE2A0]'} />
                  <span>{isInterested ? 'Interested!' : 'Interested'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal}
    </>
  );
}

export default EventCard;