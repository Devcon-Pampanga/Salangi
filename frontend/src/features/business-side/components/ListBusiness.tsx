// ListBusiness.jsx — 3-step business listing form
// Step 1: Business details + draggable pin  |  Step 2: Verification  |  Step 3: Review & Submit

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '../../../routes/paths';
import { LOCATIONS, CITY_COORDS } from '../../../constant/location';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IoFastFood, IoStorefront, IoBowlingBallSharp } from "react-icons/io5";
import { FaConciergeBell, FaHotel, FaHandHoldingHeart } from "react-icons/fa";

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import phoneIcon from '../../../assets/icons/phone-icon.svg';
import emailIcon from '../../../assets/icons/emain-icon.svg';
import fbIcon from '../../../assets/icons/fb-icon.svg';
import webIcon from '../../../assets/icons/web-icon.svg';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ── Types ────────────────────────────────────────────────────────────────────

type Category = 'Food & Drinks' | 'Shops' | 'Activities' | 'Services' | 'Stay' | 'Community & Essentials' | '';

interface FormState {
  name: string;
  category: Category;
  description: string;
  operatingDays: string[];
  openingTime: string;
  closingTime: string;
  city: string;
  barangay: string;
  street: string;
  otherDetails: string;
  phone: string;
  email: string;
  facebook: string;
  website: string;
  images: File[];
  imagePreviews: string[];
  businessPermit: File | null;
  permitPreview: string | null;
  governmentId: File | null;
  idPreview: string | null;
  selfie: File | null;
  selfiePreview: string | null;
  lat: number | null;
  lng: number | null;
}

interface StepBarProps { current: number; }
interface FileUploadAreaProps {
  label: string; accept: string; preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hint?: string;
}
interface FieldProps { label: string; children: React.ReactNode; }
interface TextInputProps {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { label: Category; icon: any }[] = [
  { label: 'Food & Drinks', icon: IoFastFood },
  { label: 'Shops', icon: IoStorefront },
  { label: 'Activities', icon: IoBowlingBallSharp },
  { label: 'Services', icon: FaConciergeBell },
  { label: 'Stay', icon: FaHotel },
  { label: 'Community & Essentials', icon: FaHandHoldingHeart },
];

const OPERATING_DAYS = ['Daily', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STEPS = [
  { id: 1, label: 'Business Details' },
  { id: 2, label: 'Verification' },
  { id: 3, label: 'Review & Submit' },
];

const INITIAL_FORM: FormState = {
  name: '', category: '', description: '', operatingDays: [],
  openingTime: '', closingTime: '', city: '', barangay: '',
  street: '', otherDetails: '', phone: '', email: '', facebook: '', website: '',
  images: [], imagePreviews: [],
  businessPermit: null, permitPreview: null,
  governmentId: null, idPreview: null,
  selfie: null, selfiePreview: null,
  lat: null, lng: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=ph`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ── Upload helpers ────────────────────────────────────────────────────────────

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('listings-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) { console.error('Upload error:', error); return null; }

  const { data: { publicUrl } } = supabase.storage
    .from('listings-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

async function uploadImages(files: File[]): Promise<string[]> {
  const urls = await Promise.all(files.map(f => uploadFile(f, 'listings')));
  return urls.filter(Boolean) as string[];
}

// ── Draggable Pin Map ─────────────────────────────────────────────────────────

interface DraggableMapProps {
  lat: number; lng: number; onPinMove: (lat: number, lng: number) => void;
}

function DraggableMap({ lat, lng, onPinMove }: DraggableMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([lat, lng], 17);
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPinMove(pos.lat, pos.lng);
      });
    }
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current.flyTo([lat, lng], 17, { animate: true, duration: 1 });
  }, [lat, lng]);

  return (
    <div className="flex flex-col gap-2">
      <div ref={mapRef} style={{ height: '220px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
      <p className="text-xs text-[#FBFAF8]/40 text-center">
        📍 Drag the pin to set the exact location of your business
      </p>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBar({ current }: StepBarProps) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              current >= step.id ? 'bg-[#FFE2A0] text-[#1A1A1A]' : 'bg-[#373737] text-[#FBFAF8]/40'
            }`}>
              {current > step.id ? '✓' : step.id}
            </div>
            <p className={`text-xs mt-2 whitespace-nowrap ${current >= step.id ? 'text-[#FFE2A0]' : 'text-[#FBFAF8]/30'}`}>
              {step.label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 transition-all ${current > step.id ? 'bg-[#FFE2A0]' : 'bg-[#373737]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FileUploadArea({ label, accept, preview, onChange, hint }: FileUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm text-[#FBFAF8]/70 mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden ${
          preview ? 'border-[#FFE2A0]/40 h-40' : 'border-[#373737] hover:border-[#FFE2A0]/40 h-32'
        }`}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <span className="text-2xl">🔎</span>
            <p className="text-[#FBFAF8]/50 text-sm">Click to upload</p>
            {hint && <p className="text-[#FBFAF8]/30 text-xs">{hint}</p>}
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
    </div>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm text-[#FBFAF8]/70 mb-2">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: TextInputProps) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 placeholder-[#FBFAF8]/30 transition-all"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function ListBusiness() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const geocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!form.city) return;
    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    geocodeTimeout.current = setTimeout(async () => {
      setGeocoding(true);
      const attempts = [
        form.street ? `${form.street}, ${form.barangay}, ${form.city}, Pampanga, Philippines` : null,
        form.barangay ? `${form.barangay}, ${form.city}, Pampanga, Philippines` : null,
        `${form.city}, Pampanga, Philippines`,
      ].filter(Boolean) as string[];

      let coords: { lat: number; lng: number } | null = null;
      for (const address of attempts) {
        coords = await geocodeAddress(address);
        if (coords) break;
      }
      if (!coords) coords = CITY_COORDS[form.city] ?? { lat: 15.1450, lng: 120.5887 };
      setForm((prev) => ({ ...prev, lat: coords!.lat, lng: coords!.lng }));
      setGeocoding(false);
    }, 800);
    return () => { if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current); };
  }, [form.street, form.barangay, form.city]);

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const newFiles = Array.from(e.target.files ?? []);
    const newPreviews = await Promise.all(newFiles.map(readFileAsDataURL));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));
  };

  const removeImage = (index: number): void => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleDoc = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileKey: 'businessPermit' | 'governmentId' | 'selfie',
    previewKey: 'permitPreview' | 'idPreview' | 'selfiePreview'
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = await readFileAsDataURL(file);
    update(fileKey, file);
    update(previewKey, preview);
  };

  const step1Valid: boolean =
    form.name.trim() !== '' && form.category !== '' && form.description.trim() !== '' &&
    form.operatingDays.length > 0 && form.openingTime !== '' && form.closingTime !== '' &&
    form.city !== '' && form.barangay !== '' && form.street.trim() !== '' &&
    form.lat !== null && form.lng !== null;

  const step2Valid: boolean = form.businessPermit !== null && form.governmentId !== null;

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const fmt = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
      };
      const hours = `${form.operatingDays.join(', ')}, ${fmt(form.openingTime)} – ${fmt(form.closingTime)}`;
      const location = [
        form.street, form.barangay, form.city, 'Pampanga',
        form.otherDetails ? `(${form.otherDetails})` : '',
      ].filter(Boolean).join(', ');
      const lat = form.lat ?? CITY_COORDS[form.city]?.lat ?? 15.1450;
      const lng = form.lng ?? CITY_COORDS[form.city]?.lng ?? 120.5887;

      const [imageUrls, businessPermitUrl, governmentIdUrl, selfieUrl] = await Promise.all([
        form.images.length > 0 ? uploadImages(form.images) : Promise.resolve([]),
        form.businessPermit ? uploadFile(form.businessPermit, 'permits') : Promise.resolve(null),
        form.governmentId ? uploadFile(form.governmentId, 'ids') : Promise.resolve(null),
        form.selfie ? uploadFile(form.selfie, 'selfies') : Promise.resolve(null),
      ]);

      // Get the currently logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      const { data: insertedListing, error } = await supabase
        .from('listings')
        .insert({
          name: form.name,
          category: form.category,
          description: form.description,
          hours,
          location,
          lat,
          lng,
          images: imageUrls,
          verified: false,
          phone: form.phone ? `+63${form.phone}` : null,
          email: form.email.trim() || null,
          facebook: form.facebook.trim() || null,
          website: form.website.trim() || null,
          business_permit: businessPermitUrl,
          government_id: governmentIdUrl,
          selfie_verification: selfieUrl,
          user_id: user?.id ?? null,
        })
        .select('id, name')
        .single();

      if (error) throw error;

      // ── FIX: Also insert listing images into gallery_images table ──
      // This ensures photos added during listing creation appear in the Gallery
      if (imageUrls.length > 0 && insertedListing) {
        const galleryRows = imageUrls.map((url) => ({
          url,
          alt: form.name,
          listing_id: insertedListing.id,
          listing_name: insertedListing.name,
          storage_path: url, // using the public URL as storage path reference
        }));

        const { error: galleryError } = await supabase
          .from('gallery_images')
          .insert(galleryRows);

        if (galleryError) {
          // Non-fatal: listing was saved, just log the gallery sync error
          console.error('Gallery sync error:', galleryError);
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError('Failed to submit listing. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="relative w-full min-h-screen bg-[#1A1A1A] text-[#FBFAF8] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-['Playfair-Display'] mb-3">
            Listing <span className="text-[#FFE2A0]">Submitted!</span>
          </h2>
          <p className="text-[#FBFAF8]/60 text-sm mb-8">
            Your business has been submitted for review. We'll verify your documents
            and notify you within 2–3 business days.
          </p>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD_OVERVIEW)}
            className="px-6 py-3 bg-[#FFE2A0] text-[#1A1A1A] rounded-lg font-bold hover:bg-[#f5d880] transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full min-h-screen bg-[#1A1A1A] text-[#FBFAF8] overflow-y-auto overflow-x-hidden">
      <div className="absolute top-0 right-0 w-150 h-150 translate-x-60 -translate-y-60 bg-radial from-[#FFE2A0]/40 via-[#FFE2A0]/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 lg:py-20 pb-24">
        <button
          onClick={() => navigate(ROUTES.DASHBOARD_OVERVIEW)}
          className="gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] text-sm mb-8 cursor-pointer transition-colors mr-80"
        >
        Go to Business Dashboard →
        </button>

        <h1 className="font-['Playfair-Display'] text-3xl leading-tight mb-2">
          List your <span className="text-[#FFE2A0]">business.</span>
        </h1>
        <p className="text-[#FBFAF8]/50 text-sm mb-8">
          Join the Pampanga local directory and reach more customers.
        </p>

        <StepBar current={step} />

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <Field label="Business Name *">
              <TextInput value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Aling Lucing's Restaurant" />
            </Field>

            <Field label="Category *">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button 
                      key={cat.label} 
                      onClick={() => update('category', cat.label)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        form.category === cat.label 
                          ? 'bg-[#FFE2A0] text-[#1A1A1A] border-[#FFE2A0] shadow-lg shadow-[#FFE2A0]/20 scale-[1.02]' 
                          : 'bg-[#2D2D2D] text-[#FBFAF8]/70 border-transparent hover:border-[#FFE2A0]/40'
                      }`}
                    >
                      <Icon className="size-5" />
                      <span className="text-center px-1">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Description *">
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                placeholder="Tell visitors what makes your business special..." rows={4}
                className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 placeholder-[#FBFAF8]/30 transition-all resize-none"
              />
            </Field>

            <Field label="Operating Days *">
              <div className="flex flex-wrap gap-2">
                {OPERATING_DAYS.map((day) => {
                  const isActive =
                    day === 'Daily'
                      ? form.operatingDays.includes('Daily')
                      : form.operatingDays.includes(day) && !form.operatingDays.includes('Daily');
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (day === 'Daily') {
                          update('operatingDays', form.operatingDays.includes('Daily') ? [] : ['Daily']);
                        } else {
                          const without = form.operatingDays.filter(d => d !== 'Daily');
                          const toggled = without.includes(day)
                            ? without.filter(d => d !== day)
                            : [...without, day];
                          update('operatingDays', toggled);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border ${
                        isActive ? 'bg-[#FFE2A0] text-[#1A1A1A] border-[#FFE2A0]' : 'bg-[#2D2D2D] text-[#FBFAF8]/70 border-transparent hover:border-[#FFE2A0]/40'
                      }`}
                    >{day}</button>
                  );
                })}
              </div>
            </Field>

            <div className="flex gap-4">
              <Field label="Opening Time *">
                <TextInput type="time" value={form.openingTime} onChange={(e) => update('openingTime', e.target.value)} />
              </Field>
              <Field label="Closing Time *">
                <TextInput type="time" value={form.closingTime} onChange={(e) => update('closingTime', e.target.value)} />
              </Field>
            </div>

            <Field label="City *">
              <select value={form.city} onChange={(e) => { update('city', e.target.value); update('barangay', ''); }}
                className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 transition-all">
                <option value="">Select a city / municipality</option>
                {Object.keys(LOCATIONS).map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </Field>

            {form.city && (
              <Field label="Barangay *">
                <select value={form.barangay} onChange={(e) => update('barangay', e.target.value)}
                  className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 transition-all">
                  <option value="">Select a barangay</option>
                  {LOCATIONS[form.city].map(brgy => <option key={brgy} value={brgy}>{brgy}</option>)}
                </select>
              </Field>
            )}

            <Field label="Street / Building No. *">
              <TextInput value={form.street} onChange={(e) => update('street', e.target.value)} placeholder="e.g. 123 Sto. Rosario St." />
            </Field>

            <Field label="Other Details (optional)">
              <TextInput value={form.otherDetails} onChange={(e) => update('otherDetails', e.target.value)} placeholder="e.g. Near SM Clark, 2nd floor of the building" />
            </Field>

            {form.lat !== null && form.lng !== null && (
              <Field label="Pin Location *">
                {geocoding && <p className="text-xs text-[#FFE2A0]/70 mb-2 animate-pulse">📡 Finding location...</p>}
                <DraggableMap lat={form.lat} lng={form.lng} onPinMove={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))} />
              </Field>
            )}

            <div className="border-t border-[#373737] pt-5">
              <p className="text-xs text-[#FFE2A0]/70 font-semibold uppercase tracking-wider mb-4">Contact & Social (optional)</p>
              <div className="flex flex-col gap-4">
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center"><img src={phoneIcon} alt="phone" className="w-5 h-5" /></div>
                  <div className="flex-1 flex items-center bg-[#2D2D2D] rounded-lg border border-transparent focus-within:border-[#FFE2A0]/40 transition-all overflow-hidden">
                    <span className="px-3 text-sm text-[#FBFAF8]/50 border-r border-[#FBFAF8]/10 py-3 select-none">+63</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        update('phone', digits);
                      }}
                      placeholder="912 345 6789"
                      className="flex-1 bg-transparent text-[#FBFAF8] text-sm px-3 py-3 outline-none placeholder-[#FBFAF8]/30"
                    />
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center"><img src={emailIcon} alt="email" className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <TextInput
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="business@email.com"
                    />
                  </div>
                </div>
                {/* Facebook */}
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center"><img src={fbIcon} alt="facebook" className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <TextInput value={form.facebook} onChange={(e) => update('facebook', e.target.value)} placeholder="facebook.com/yourbusiness" />
                  </div>
                </div>
                {/* Website */}
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center"><img src={webIcon} alt="website" className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <TextInput value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="www.yourbusiness.com" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#373737] pt-5">
              <p className="text-xs text-[#FFE2A0]/70 font-semibold uppercase tracking-wider mb-4">Business Photos (optional)</p>
              <div className="flex gap-3 flex-wrap">
                {form.imagePreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-lg border border-[#FFE2A0]/20" />
                    <button onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      ✕
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#373737] hover:border-[#FFE2A0]/40 rounded-lg cursor-pointer transition-colors text-center text-xs text-[#FBFAF8]/40">
                  <span className="text-xl">+</span>
                  <span>Add photo</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                </label>
              </div>
              <p className="text-xs text-[#FBFAF8]/30 mt-2">JPG, PNG, WEBP · Max 5MB each · Hover photo to remove</p>
            </div>

            <button onClick={() => { if (step1Valid) setStep(2); }} disabled={!step1Valid}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all mt-4 ${
                step1Valid ? 'bg-[#FFE2A0] text-[#1A1A1A] hover:bg-[#f5d880] cursor-pointer' : 'bg-[#373737] text-[#FBFAF8]/30 cursor-not-allowed'
              }`}>
              Continue to Verification →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#2D2D2D] border border-[#FFE2A0]/20 rounded-xl p-4">
              <p className="text-[#FFE2A0] font-semibold text-sm mb-1">🔒 Why we verify</p>
              <p className="text-[#FBFAF8]/60 text-xs leading-relaxed">
                This step is required to prevent fake or fraudulent listings and to ensure the safety of all users in our community. Your documents are kept private and only used for verification purposes.
              </p>
            </div>

            <FileUploadArea label="Business Permit * (Required)" accept="image/*,application/pdf" preview={form.permitPreview} hint="JPG, PNG, or PDF · Max 5MB" onChange={(e) => handleDoc(e, 'businessPermit', 'permitPreview')} />
            <FileUploadArea label="Valid Government ID * (Required)" accept="image/*" preview={form.idPreview} hint="Passport, Driver's License, SSS, PhilHealth, etc." onChange={(e) => handleDoc(e, 'governmentId', 'idPreview')} />
            <FileUploadArea label="Selfie Verification (Optional)" accept="image/*" preview={form.selfiePreview} hint="Photo of you holding your ID for extra trust" onChange={(e) => handleDoc(e, 'selfie', 'selfiePreview')} />

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold text-sm bg-[#373737] text-[#FBFAF8]/70 hover:bg-[#454545] transition-all cursor-pointer">← Back</button>
              <button onClick={() => { if (step2Valid) setStep(3); }} disabled={!step2Valid}
                className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${
                  step2Valid ? 'bg-[#FFE2A0] text-[#1A1A1A] hover:bg-[#f5d880] cursor-pointer' : 'bg-[#373737] text-[#FBFAF8]/30 cursor-not-allowed'
                }`}>
                Review Listing →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#2D2D2D] rounded-xl p-5 border border-zinc-700">
              <p className="text-[#FFE2A0] font-semibold text-sm mb-4">Business Details</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Business Name</p><p className="text-[#FBFAF8] font-medium">{form.name}</p></div>
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Category</p><p className="text-[#FBFAF8] font-medium">{form.category}</p></div>
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Operating Days</p><p className="text-[#FBFAF8] font-medium">{form.operatingDays.join(', ') || '—'}</p></div>
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Hours</p><p className="text-[#FBFAF8] font-medium">{form.openingTime} – {form.closingTime}</p></div>
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">City</p><p className="text-[#FBFAF8] font-medium">{form.city}, Pampanga</p></div>
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Barangay</p><p className="text-[#FBFAF8] font-medium">{form.barangay}</p></div>
                <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Street / Building No.</p><p className="text-[#FBFAF8] font-medium">{form.street}</p></div>
                {form.otherDetails && <div><p className="text-[#FBFAF8]/40 text-xs mb-1">Other Details</p><p className="text-[#FBFAF8] font-medium">{form.otherDetails}</p></div>}
              </div>
              <div className="mt-4">
                <p className="text-[#FBFAF8]/40 text-xs mb-1">Description</p>
                <p className="text-[#FBFAF8] text-sm">{form.description}</p>
              </div>
              {(form.phone || form.email || form.facebook || form.website) && (
                <div className="mt-4 border-t border-zinc-700 pt-4">
                  <p className="text-[#FBFAF8]/40 text-xs mb-3">Contact & Social</p>
                  <div className="flex flex-col gap-2 text-sm">
                    {form.phone && <div className="flex items-center gap-2"><img src={phoneIcon} className="w-4 h-4 opacity-50" /><span className="text-[#FBFAF8]/80">+63{form.phone}</span></div>}
                    {form.email && <div className="flex items-center gap-2"><img src={emailIcon} className="w-4 h-4 opacity-50" /><span className="text-[#FBFAF8]/80">{form.email}</span></div>}
                    {form.facebook && <div className="flex items-center gap-2"><img src={fbIcon} className="w-4 h-4 opacity-50" /><span className="text-[#FBFAF8]/80">{form.facebook}</span></div>}
                    {form.website && <div className="flex items-center gap-2"><img src={webIcon} className="w-4 h-4 opacity-50" /><span className="text-[#FBFAF8]/80">{form.website}</span></div>}
                  </div>
                </div>
              )}
              {form.imagePreviews.length > 0 && (
                <div className="mt-4 border-t border-zinc-700 pt-4">
                  <p className="text-[#FBFAF8]/40 text-xs mb-2">Photos ({form.imagePreviews.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {form.imagePreviews.map((src, i) => (
                      <img key={i} src={src} alt={`photo-${i}`} className="w-16 h-16 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#2D2D2D] rounded-xl p-5 border border-zinc-700">
              <p className="text-[#FFE2A0] font-semibold text-sm mb-4">Verification Documents</p>
              <div className="flex gap-4">
                {form.permitPreview && (
                  <div className="text-center">
                    <img src={form.permitPreview} alt="permit" className="w-20 h-20 object-cover rounded-lg mb-1" />
                    <p className="text-xs text-[#FBFAF8]/40">Business Permit</p>
                  </div>
                )}
                {form.idPreview && (
                  <div className="text-center">
                    <img src={form.idPreview} alt="id" className="w-20 h-20 object-cover rounded-lg mb-1" />
                    <p className="text-xs text-[#FBFAF8]/40">Government ID</p>
                  </div>
                )}
                {form.selfiePreview && (
                  <div className="text-center">
                    <img src={form.selfiePreview} alt="selfie" className="w-20 h-20 object-cover rounded-lg mb-1" />
                    <p className="text-xs text-[#FBFAF8]/40">Selfie</p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[#FBFAF8]/40 text-xs leading-relaxed">
              By submitting, you confirm that all information provided is accurate and that you are authorized to list this business. False submissions may result in a permanent ban.
            </p>

            {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}
            {submitting && (
              <div className="text-center">
                <p className="text-[#FFE2A0]/70 text-sm animate-pulse">⏳ Uploading images and submitting your listing...</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} disabled={submitting}
                className="flex-1 py-4 rounded-xl font-bold text-sm bg-[#373737] text-[#FBFAF8]/70 hover:bg-[#454545] transition-all cursor-pointer disabled:opacity-50">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-4 rounded-xl font-bold text-sm bg-[#FFE2A0] text-[#1A1A1A] hover:bg-[#f5d880] disabled:opacity-50 transition-all cursor-pointer">
                {submitting ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ListBusiness;