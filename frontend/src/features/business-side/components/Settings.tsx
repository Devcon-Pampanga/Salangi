import { useState, useEffect } from "react";
import { HiOutlineBell } from "react-icons/hi";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth";

type NotificationKey = "savedListing" | "eventAttendance";

const NOTIFICATION_LABELS: Record<NotificationKey, string> = {
  savedListing: "User Saves Listing",
  eventAttendance: "Event Attendance",
};

const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = {
  savedListing: true,
  eventAttendance: true,
};

const Settings = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [savingKey, setSavingKey] = useState<NotificationKey | null>(null);

  // ── Load business name ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("listings")
      .select("name")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()                          // ← was .single() — avoids 406 when no listing yet
      .then(({ data }) => {
        if (data?.name) setBusinessName(data.name);
      });
  }, [user?.id]);

  // ── Load saved notification prefs from DB ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("business_notification_settings")
      .select("saved_listing, event_attendance")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNotifications({
            savedListing: data.saved_listing ?? true,
            eventAttendance: data.event_attendance ?? true,
          });
        }
        // If no row exists yet, leave defaults — they'll be written on first toggle
      });
  }, [user?.id]);

  // ── Toggle + persist ───────────────────────────────────────────────────────
  const toggleNotification = async (key: NotificationKey) => {
    if (!user?.id || savingKey) return;

    const newValue = !notifications[key];

    // Optimistic update
    setNotifications(prev => ({ ...prev, [key]: newValue }));
    setSavingKey(key);

    const dbColumn = key === "savedListing" ? "saved_listing" : "event_attendance";

    const { error } = await supabase
      .from("business_notification_settings")
      .upsert(
        { user_id: user.id, [dbColumn]: newValue },
        { onConflict: "user_id" }             // upsert: insert first time, update after
      );

    if (error) {
      console.error("Failed to save notification setting:", error.message);
      // Roll back optimistic update
      setNotifications(prev => ({ ...prev, [key]: !newValue }));
    }

    setSavingKey(null);
  };

  return (
    <div className="w-full h-full pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-4 md:px-6 py-4">
        <h1 className="font-['Playfair_Display'] text-white text-2xl md:text-3xl font-semibold tracking-wide cursor-default">
          Business <span className="text-[#FFE2A0]">Settings</span>
        </h1>
        <p className="text-white text-sm">
          Manage your business profile, availability, and preferences
        </p>
        {businessName && (
          <p className="text-[#FFE2A0] text-xs mt-1 opacity-70">{businessName}</p>
        )}
      </div>

      <div className="px-4 md:px-6 py-4 space-y-10 max-w-6xl">
        <div className="grid grid-cols-1 gap-10 pt-4">
          {/* Notifications */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#4d4d4d] pb-2">
              <HiOutlineBell className="text-[#FFE2A0] size-6" />
              <h2 className="text-white text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              {(Object.keys(NOTIFICATION_LABELS) as NotificationKey[]).map((key) => {
                const isThisOneSaving = savingKey === key;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">
                        {NOTIFICATION_LABELS[key]}
                      </span>
                      <span className="text-[#a0a0a0] text-[10px]">
                        {isThisOneSaving ? "Saving…" : "Get notified instantly"}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleNotification(key)}
                      disabled={!!savingKey}
                      aria-label={`Toggle ${NOTIFICATION_LABELS[key]}`}
                      className={`w-12 h-6 rounded-full transition-all relative
                        ${notifications[key] ? "bg-[#FFE2A0]" : "bg-[#4d4d4d]"}
                        ${savingKey ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                          ${notifications[key] ? "left-7" : "left-1"}
                        `}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;