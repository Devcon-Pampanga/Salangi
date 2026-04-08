import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  userName: string;
  userAvatar: string | null;
}

export default function Review() {
  const [userListings, setUserListings] = useState<{id: number, name: string}[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
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
          setReviews([]);
          setTotalReviews(0);
          setAverageRating(0);
          setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
          setLoading(false);
          return;
        }

        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, user_id")
          .in("listing_id", targetListingIds)
          .order("created_at", { ascending: false });

        if (!reviewsData) {
          setReviews([]);
          setTotalReviews(0);
          setAverageRating(0);
          setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
          setLoading(false);
          return;
        }

        // Fetch user info for each review
        const enriched: Review[] = await Promise.all(
          reviewsData.map(async (r) => {
            let userName = "Anonymous";
            let userAvatar: string | null = null;

            if (r.user_id) {
              const { data: userData } = await supabase
                .from("users")
                .select("first_name, last_name, profile_pic")
                .eq("user_id", r.user_id)
                .single();

              if (userData) {
                userName = `${userData.first_name} ${userData.last_name}`;
                userAvatar = userData.profile_pic ?? null;
              }
            }

            return { ...r, userName, userAvatar };
          })
        );

        setReviews(enriched);
        setTotalReviews(enriched.length);

        if (enriched.length > 0) {
          const avg = enriched.reduce((sum, r) => sum + r.rating, 0) / enriched.length;
          setAverageRating(parseFloat(avg.toFixed(1)));
        }

        const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        enriched.forEach((r) => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
        setRatingCounts(counts);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [activeFilter]);

  const maxCount = Math.max(...Object.values(ratingCounts), 1);

  const ratingBarColors: Record<number, string> = {
    5: "bg-[#2eb09c]",
    4: "bg-[#c084fc]",
    3: "bg-[#fbbf24]",
    2: "bg-[#22d3ee]",
    1: "bg-[#f97316]",
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  };

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-0">
        <div className="mb-4">
          <h1 className="font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide cursor-default">
            Customer <span className="text-[#FFE2A0]">Reviews</span>
          </h1>
          <p className="text-white text-sm">Monitor and respond to your latest business feedback</p>
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-6 gap-3">
        <h2 className="text-[#FFE2A0] text-xl font-['Playfair_Display'] font-semibold">Overall Rating</h2>
      </div>

      {loading ? (
        <p className="text-[#a0a0a0] text-sm">Loading reviews...</p>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Total Reviews */}
            <div className="w-full flex-1 min-h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
              <p className="text-white text-lg font-semibold tracking-wide mb-4">Total Reviews</p>
              <div className="flex flex-row items-center gap-3 mb-2">
                <p className="text-5xl text-white">{totalReviews.toLocaleString()}</p>
              </div>
              <p className="text-[#dbdbdb]">Total reviews all time</p>
            </div>

            {/* Average Rating */}
            <div className="w-full flex-1 min-h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] rounded-xl">
              <p className="text-white text-lg font-semibold tracking-wide mb-4">Average Rating</p>
              <div className="flex flex-row items-center gap-3 mb-2">
                <p className="text-5xl text-white">{averageRating || "—"}</p>
                <div className="flex flex-row gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill={i < Math.round(averageRating) ? "#FFB800" : "#4B4B4B"} className="size-7">
                      <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-[#dbdbdb]">Average rating all time</p>
            </div>

            {/* Rating Breakdown */}
            <div className="w-full flex-1 min-h-50 px-6 py-6 bg-[#3a3a3a] border border-[#4d4d4d] flex flex-col justify-between rounded-xl">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-1 w-8 shrink-0">
                    <span className="text-gray-400 text-sm">★</span>
                    <span className="text-white text-sm font-medium">{star}</span>
                  </div>
                  <div className="flex-1 h-2 bg-[#4b4b4b] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ratingBarColors[star]}`}
                      style={{ width: `${(ratingCounts[star] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 shrink-0 text-right">{ratingCounts[star]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-px my-5 bg-[#4b4b4b]" />

          {/* Reviews List */}
          <div className="mt-5">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner transition-transform hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.154-.63 4.5 4.5 0 0 1 .767-2.327C3.392 16.483 2.25 14.366 2.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="text-white text-xl font-semibold tracking-wide font-['Playfair_Display']">No Reviews Yet</h3>
                  <p className="text-[#a0a0a0] text-sm font-light max-w-xs mx-auto leading-relaxed">
                    Your customers haven't shared their feedback yet. Positive reviews will help you stand out!
                  </p>
                </div>
              </div>
            ) : (
              reviews.map((rev, index) => (
                <div key={rev.id} className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-8 max-w-7xl">
                  {/* Left: User */}
                  <div className="w-full sm:w-70 flex flex-row items-start gap-4 shrink-0">
                    {rev.userAvatar ? (
                      <img src={rev.userAvatar} alt={rev.userName} className="size-16 rounded-xl object-cover" />
                    ) : (
                      <div className="size-16 rounded-xl bg-[#474133] border border-[#5a5241] flex items-center justify-center text-[#FFE2A0] text-xl font-bold">
                        {rev.userName.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mt-1">
                      <h2 className="text-white text-md font-semibold tracking-wide">{rev.userName}</h2>
                    </div>
                  </div>

                  {/* Right: Review */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 mt-1">
                      <div className="flex flex-row gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} viewBox="0 0 24 24" fill={i < rev.rating ? "#FFB800" : "#4B4B4B"} className="size-4">
                            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[#9ca3af] text-sm">{formatDate(rev.created_at)}</span>
                    </div>
                    <p className="text-[#e5e7eb] text-md leading-relaxed tracking-wide">{rev.comment}</p>
                    {index !== reviews.length - 1 && (
                      <div className="w-full h-px mt-8 mb-2 bg-[#4b4b4b]" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}