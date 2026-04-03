// ListBusiness.jsx — 3-step business listing form
// Step 1: Business details  |  Step 2: Verification  |  Step 3: Review & Submit

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────────────────────

type Category = 'Resto' | 'Cafe' | 'Activities' | '';

interface FormState {
  name: string;
  category: Category;
  description: string;
  openingTime: string;
  closingTime: string;
  city: string;
  barangay: string;
  street: string;
  otherDetails: string;
  images: File[];
  imagePreviews: string[];
  businessPermit: File | null;
  permitPreview: string | null;
  governmentId: File | null;
  idPreview: string | null;
  selfie: File | null;
  selfiePreview: string | null;
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

const CATEGORIES: Category[] = ['Resto', 'Cafe', 'Activities'];

const STEPS = [
  { id: 1, label: 'Business Details' },
  { id: 2, label: 'Verification' },
  { id: 3, label: 'Review & Submit' },
];

const LOCATIONS: Record<string, string[]> = {
  'Angeles City': [
    'Balibago', 'Capaya', 'Claro M. Recto', 'Cuayan', 'Cutcut',
    'Lourdes North West', 'Lourdes Sur', 'Malabanias', 'Pampang',
    'Pulung Cacutud', 'Pulung Maragul', 'Salapungan', 'San Jose',
    'Santa Trinidad', 'Santo Cristo', 'Santo Domingo', 'Santo Rosario',
    'Telecom', 'Agapito del Rosario', 'Anunas', 'Margot', 'Mining',
    'Ninoy Aquino', 'Pandan', 'Pulungbulo', 'Virgen Delos Remedios',
  ],
  'San Fernando': [
    'Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Del Carmen',
    'Del Pilar', 'Del Rosario', 'Dolores', 'Juliana', 'Lara',
    'Lourdes', 'Magliman', 'Maimpis', 'Malino', 'Malpitic',
    'Pandaras', 'Panipuan', 'Pulung Bulu', 'Quebiawan', 'Saguin',
    'San Agustin', 'San Felipe', 'San Isidro', 'San Jose',
    'San Nicolas', 'San Pedro', 'Santa Lucia', 'Santa Teresita',
    'Santiago', 'Sindalan', 'Telabastagan',
  ],
  'Mabalacat': [
    'Atlu-Bola', 'Bical', 'Bundagul', 'Cacutud', 'Calumpang',
    'Camachiles', 'Dapdap', 'Dau', 'Dolores', 'Duquit',
    'Lakandula', 'Mabiga', 'Macapagal', 'Mamatitang', 'Mangalit',
    'Marcos Village', 'Mawaque', 'Paralayunan', 'Poblacion',
    'San Francisco', 'San Joaquin', 'Santa Ines', 'Santa Maria',
    'Santo Rosario', 'Sapang Balen', 'Sapang Biabas', 'Tabun',
  ],
  'Clark': [
    'Clark Freeport Zone', 'Hadrian', 'Jose Abad Santos',
    'Leonico', 'Marcos', 'Philippine-American Friendship',
  ],
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Angeles City': { lat: 15.1450, lng: 120.5887 },
  'San Fernando':  { lat: 15.0289, lng: 120.6898 },
  'Mabalacat':     { lat: 15.2167, lng: 120.5833 },
  'Clark':         { lat: 15.1860, lng: 120.5540 },
};

const INITIAL_FORM: FormState = {
  name: '',
  category: '',
  description: '',
  openingTime: '',
  closingTime: '',
  city: '',
  barangay: '',
  street: '',
  otherDetails: '',
  images: [],
  imagePreviews: [],
  businessPermit: null,
  permitPreview: null,
  governmentId: null,
  idPreview: null,
  selfie: null,
  selfiePreview: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
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

  const update = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(e.target.files ?? []);
    const previews = await Promise.all(files.map(readFileAsDataURL));
    update('images', files);
    update('imagePreviews', previews);
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
    form.name.trim() !== '' &&
    form.category !== '' &&
    form.description.trim() !== '' &&
    form.openingTime !== '' &&
    form.closingTime !== '' &&
    form.city !== '' &&
    form.barangay !== '' &&
    form.street.trim() !== '';

  const step2Valid: boolean = form.businessPermit !== null && form.governmentId !== null;

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const hours = `${form.openingTime} – ${form.closingTime}`;
      const coords = CITY_COORDS[form.city];
      const location = [
        form.street,
        form.barangay,
        form.city,
        'Pampanga',
        form.otherDetails ? `(${form.otherDetails})` : '',
      ].filter(Boolean).join(', ');

      const { error } = await supabase.from('listings').insert({
        name: form.name,
        category: form.category,
        description: form.description,
        hours: hours,
        location: location,
        lat: coords.lat,
        lng: coords.lng,
        images: [],
        verified: false,
      });

      if (error) throw error;
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
      <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] flex items-center justify-center">
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
            onClick={() => navigate('/dashboard/mybusiness')}
            className="px-6 py-3 bg-[#FFE2A0] text-[#1A1A1A] rounded-lg font-bold hover:bg-[#f5d880] transition-colors cursor-pointer"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-[#1A1A1A] text-[#FBFAF8] overflow-y-auto overflow-x-hidden">
      <div className="absolute top-0 right-0 w-150 h-150 translate-x-60 -translate-y-60 bg-radial from-[#FFE2A0]/40 via-[#FFE2A0]/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/dashboard/mybusiness')}
          className="flex items-center gap-2 text-[#FBFAF8]/50 hover:text-[#FBFAF8] text-sm mb-8 cursor-pointer transition-colors"
        >
          ← Back
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
              <TextInput
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Aling Lucing's Restaurant"
              />
            </Field>

            <Field label="Category *">
              <div className="flex gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => update('category', cat)}
                    className={`flex-1 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all border ${
                      form.category === cat
                        ? 'bg-[#FFE2A0] text-[#1A1A1A] border-[#FFE2A0]'
                        : 'bg-[#2D2D2D] text-[#FBFAF8]/70 border-transparent hover:border-[#FFE2A0]/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Description *">
              <textarea
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update('description', e.target.value)}
                placeholder="Tell visitors what makes your business special..."
                rows={4}
                className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 placeholder-[#FBFAF8]/30 transition-all resize-none"
              />
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
              <select
                value={form.city}
                onChange={(e) => { update('city', e.target.value); update('barangay', ''); }}
                className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 transition-all"
              >
                <option value="">Select a city</option>
                {Object.keys(LOCATIONS).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </Field>

            {form.city && (
              <Field label="Barangay *">
                <select
                  value={form.barangay}
                  onChange={(e) => update('barangay', e.target.value)}
                  className="w-full bg-[#2D2D2D] text-[#FBFAF8] text-sm rounded-lg px-4 py-3 outline-none border border-transparent focus:border-[#FFE2A0]/40 transition-all"
                >
                  <option value="">Select a barangay</option>
                  {LOCATIONS[form.city].map(brgy => (
                    <option key={brgy} value={brgy}>{brgy}</option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Street / Building No. *">
              <TextInput
                value={form.street}
                onChange={(e) => update('street', e.target.value)}
                placeholder="e.g. 123 Sto. Rosario St."
              />
            </Field>

            <Field label="Other Details (optional)">
              <TextInput
                value={form.otherDetails}
                onChange={(e) => update('otherDetails', e.target.value)}
                placeholder="e.g. Near SM Clark, 2nd floor of the building"
              />
            </Field>

            <Field label="Business Photos (optional)">
              <div className="flex gap-3 flex-wrap">
                {form.imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-lg border border-[#FFE2A0]/20" />
                ))}
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#373737] hover:border-[#FFE2A0]/40 rounded-lg cursor-pointer transition-colors text-center text-xs text-[#FBFAF8]/40">
                  <span className="text-xl">+</span>
                  <span>Add photo</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                </label>
              </div>
            </Field>

            <button
              onClick={() => { if (step1Valid) setStep(2); }}
              disabled={!step1Valid}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all mt-4 ${
                step1Valid
                  ? 'bg-[#FFE2A0] text-[#1A1A1A] hover:bg-[#f5d880] cursor-pointer'
                  : 'bg-[#373737] text-[#FBFAF8]/30 cursor-not-allowed'
              }`}
            >
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
                This step is required to prevent fake or fraudulent listings and to ensure
                the safety of all users in our community. Your documents are kept private
                and only used for verification purposes.
              </p>
            </div>

            <FileUploadArea
              label="Business Permit * (Required)"
              accept="image/*,application/pdf"
              preview={form.permitPreview}
              hint="JPG, PNG, or PDF · Max 5MB"
              onChange={(e) => handleDoc(e, 'businessPermit', 'permitPreview')}
            />
            <FileUploadArea
              label="Valid Government ID * (Required)"
              accept="image/*"
              preview={form.idPreview}
              hint="Passport, Driver's License, SSS, PhilHealth, etc."
              onChange={(e) => handleDoc(e, 'governmentId', 'idPreview')}
            />
            <FileUploadArea
              label="Selfie Verification (Optional)"
              accept="image/*"
              preview={form.selfiePreview}
              hint="Photo of you holding your ID for extra trust"
              onChange={(e) => handleDoc(e, 'selfie', 'selfiePreview')}
            />

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold text-sm bg-[#373737] text-[#FBFAF8]/70 hover:bg-[#454545] transition-all cursor-pointer">
                ← Back
              </button>
              <button
                onClick={() => { if (step2Valid) setStep(3); }}
                disabled={!step2Valid}
                className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all ${
                  step2Valid ? 'bg-[#FFE2A0] text-[#1A1A1A] hover:bg-[#f5d880] cursor-pointer' : 'bg-[#373737] text-[#FBFAF8]/30 cursor-not-allowed'
                }`}
              >
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
                <div>
                  <p className="text-[#FBFAF8]/40 text-xs mb-1">Business Name</p>
                  <p className="text-[#FBFAF8] font-medium">{form.name}</p>
                </div>
                <div>
                  <p className="text-[#FBFAF8]/40 text-xs mb-1">Category</p>
                  <p className="text-[#FBFAF8] font-medium">{form.category}</p>
                </div>
                <div>
                  <p className="text-[#FBFAF8]/40 text-xs mb-1">Hours</p>
                  <p className="text-[#FBFAF8] font-medium">{form.openingTime} – {form.closingTime}</p>
                </div>
                <div>
                  <p className="text-[#FBFAF8]/40 text-xs mb-1">City</p>
                  <p className="text-[#FBFAF8] font-medium">{form.city}, Pampanga</p>
                </div>
                <div>
                  <p className="text-[#FBFAF8]/40 text-xs mb-1">Barangay</p>
                  <p className="text-[#FBFAF8] font-medium">{form.barangay}</p>
                </div>
                <div>
                  <p className="text-[#FBFAF8]/40 text-xs mb-1">Street / Building No.</p>
                  <p className="text-[#FBFAF8] font-medium">{form.street}</p>
                </div>
                {form.otherDetails && (
                  <div className="col-span-2">
                    <p className="text-[#FBFAF8]/40 text-xs mb-1">Other Details</p>
                    <p className="text-[#FBFAF8] font-medium">{form.otherDetails}</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-[#FBFAF8]/40 text-xs mb-1">Description</p>
                <p className="text-[#FBFAF8] text-sm">{form.description}</p>
              </div>
              {form.imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-[#FBFAF8]/40 text-xs mb-2">Photos</p>
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
              By submitting, you confirm that all information provided is accurate and that
              you are authorized to list this business. False submissions may result in a permanent ban.
            </p>

            {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl font-bold text-sm bg-[#373737] text-[#FBFAF8]/70 hover:bg-[#454545] transition-all cursor-pointer">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-bold text-sm bg-[#FFE2A0] text-[#1A1A1A] hover:bg-[#f5d880] disabled:opacity-50 transition-all cursor-pointer"
              >
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