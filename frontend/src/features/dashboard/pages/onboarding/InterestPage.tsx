import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../routes/paths";
import {
  Coffee,
  UtensilsCrossed,
  Zap,
  Moon,
  CalendarDays,
  TreePine,
  ShoppingBag,
  Dumbbell,
  Check,
} from "lucide-react";

//Logo
import Logo from '@assets/png-files/salangi-logo.png'

type Interest = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const INTERESTS: Interest[] = [
  { id: "cafes",       label: "Cafes",        icon: <Coffee size={16} strokeWidth={1.6} /> },
  { id: "restaurants", label: "Restaurants",  icon: <UtensilsCrossed size={16} strokeWidth={1.6} /> },
  { id: "activities",  label: "Activities",   icon: <Zap size={16} strokeWidth={1.6} /> },
  { id: "nightlife",   label: "Nightlife",    icon: <Moon size={16} strokeWidth={1.6} /> },
  { id: "events",      label: "Events",       icon: <CalendarDays size={16} strokeWidth={1.6} /> },
  { id: "nature",      label: "Nature",       icon: <TreePine size={16} strokeWidth={1.6} /> },
  { id: "shopping",    label: "Shopping",     icon: <ShoppingBag size={16} strokeWidth={1.6} /> },
  { id: "fitness",     label: "Fitness",      icon: <Dumbbell size={16} strokeWidth={1.6} /> },
];

export default function InterestPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    console.log("Selected interests:", Array.from(selected));
    navigate(ROUTES.HOME);
  };

  const hasSelection = selected.size > 0;

  return (
    <div
      className="h-screen overflow-y-auto flex flex-col"
      style={{ backgroundColor: "#111111", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

        .pill-btn {
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background-color 0.18s ease,
                      border-color 0.18s ease;
        }
        .pill-btn:hover { transform: scale(1.05); }
        .pill-btn:active { transform: scale(0.95); }
        .pill-btn.selected { transform: scale(1.06); }

        .checkmark-pop {
          animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }

        .continue-btn {
          transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .continue-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .continue-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Logo bar */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2 md:px-10">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Salangi Logo" className="w-10 h-10 lg:w-16 lg:h-16 shrink-0" />
          <span className="text-[#d4b478] font-['Playfair_Display'] text-xl font-semibold">
            Salangi
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 px-5 pt-8 pb-6 md:px-10 md:pt-10 md:pb-6 max-w-lg mx-auto w-full">

        <div className="absolute -top-25 left-0 right-0 h-100 lg:h-500px bg-radial from-[#FFE2A0]/60 via-transparent to-transparent blur-3xl opacity-100 lg:opacity-70 pointer-events-none -translate-y-1/2" />
        <div className="absolute top-150 left-0 right-0 h-100 lg:h-500px bg-radial from-[#FFE2A0]/60 via-transparent to-transparent blur-3xl opacity-100 lg:opacity-70 pointer-events-none -translate-y-1/2" />

        {/* Header */}
        <div className="mb-7">
          <p className="text-[#d4b478] text-5xl font-semibold tracking-wide font-['Playfair_Display']">
            Personalize
          </p>
          <h1 style={{ color: "#f0ece4", fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 6vw, 32px)", fontWeight: 600, lineHeight: 1.2, marginBottom: "6px" }}>
            Choose Your<br />Interests
          </h1>
          <p style={{ color: "#555", fontSize: "13px" }}>
            Help us surface the spots you'll actually love.
          </p>
        </div>

        {/* Divider + counter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #252525, transparent)" }} />
          <span
            style={{
              fontSize: "11px",
              padding: "3px 12px",
              borderRadius: "999px",
              backgroundColor: hasSelection ? "rgba(212,180,120,0.1)" : "#181818",
              color: hasSelection ? "#d4b478" : "#3a3a3a",
              border: hasSelection ? "1px solid rgba(212,180,120,0.22)" : "1px solid #222",
              transition: "all 0.3s ease",
            }}
          >
            {selected.size} selected
          </span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #252525, transparent)" }} />
        </div>

        {/* Pill grid */}
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`pill-btn relative flex items-center gap-2 focus:outline-none ${isSelected ? "selected" : ""}`}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  backgroundColor: isSelected ? "rgba(212,180,120,0.12)" : "#1c1c1c",
                  border: isSelected ? "1px solid rgba(212,180,120,0.45)" : "1px solid #2a2a2a",
                  boxShadow: isSelected ? "0 0 12px rgba(212,180,120,0.1)" : "none",
                  cursor: "pointer",
                }}
              >
                {/* Icon */}
                <span style={{ color: isSelected ? "#d4b478" : "#555", transition: "color 0.18s ease", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: isSelected ? "#f0ece4" : "#888",
                    transition: "color 0.18s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>

                {/* Checkmark badge */}
                {isSelected && (
                  <span
                    className="checkmark-pop"
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "#d4b478",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={9} strokeWidth={3} color="#111" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Continue button */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex justify-center px-5 pb-6 pt-5"
        style={{ background: "linear-gradient(to top, #111111 65%, transparent)" }}
      >
        <button
          onClick={handleContinue}
          disabled={!hasSelection}
          className="continue-btn w-full max-w-sm rounded-2xl py-3.5 text-sm font-semibold tracking-wide"
          style={{
            backgroundColor: hasSelection ? "#d4b478" : "#1a1a1a",
            color: hasSelection ? "#111" : "#2e2e2e",
            border: hasSelection ? "none" : "1px solid #222",
            cursor: hasSelection ? "pointer" : "not-allowed",
            boxShadow: hasSelection ? "0 4px 20px rgba(212,180,120,0.22)" : "none",
          }}
        >
          {hasSelection
            ? `Continue  ·  ${selected.size} interest${selected.size > 1 ? "s" : ""}`
            : "Select at least one interest"}
        </button>
      </div>
    </div>
  );
}