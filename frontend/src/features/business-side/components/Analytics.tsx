import { useState, useEffect, useCallback } from "react";
import { HiOutlineCursorClick } from "react-icons/hi";
import StatsCard from "./StatsCard";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { BusinessFilterDropdown } from "./BusinessFilterDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayPoint {
    day: string;
    val: number;
    x: number;
    y: number;
}

interface StatsState {
    profileViews: number;
    totalInteractions: number;
    listingSaves: number;
    eventAttendance: number;
    profileViewsTrend: string;
    interactionsTrend: string;
    savesTrend: string;
    attendanceTrend: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTrend = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "—";
    const pct = ((current - previous) / previous) * 100;
    return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
};

const getDaysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

const timeframeDays: Record<string, number> = {
    "7D": 7,
    "30D": 30,
    "90D": 90,
    "1Y": 365,
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4 relative">
        <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
        </div>
        <div className="space-y-1 relative z-10">
            <h3 className="text-white text-lg font-semibold font-['Playfair_Display'] tracking-wide">Insufficient Data</h3>
            <p className="text-[#a0a0a0] text-sm font-light max-w-xs mx-auto leading-relaxed">
                We need a few more days of activity to generate your performance trends and insights.
            </p>
        </div>
    </div>
);

// ─── Chart ────────────────────────────────────────────────────────────────────
const EngagementChart = ({ data }: { data: DayPoint[] }) => {
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);

    // ✅ FIX: Show empty state if all values are 0 or there's only 1 data point
    const hasActivity = data.some(d => d.val > 0);
    if (data.length === 0 || !hasActivity) return <EmptyState />;

    const svgWidth = 1000;
    const svgHeight = 400;
    const padX = 40;
    const padY = 40;

    const vals = data.map((d) => d.val);
    const minVal = 0; // ✅ FIX: always anchor the bottom at 0, never at minVal
    const maxVal = Math.max(...vals);
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => ({
        ...d,
        sx: padX + (i / Math.max(data.length - 1, 1)) * (svgWidth - padX * 2),
        sy: svgHeight - padY - ((d.val - minVal) / range) * (svgHeight - padY * 2),
    }));

    // Smooth bezier path
    const pathD = points.reduce((acc, pt, i) => {
        if (i === 0) return `M${pt.sx},${pt.sy}`;
        const prev = points[i - 1];
        const cpX = (prev.sx + pt.sx) / 2;
        return `${acc} C${cpX},${prev.sy} ${cpX},${pt.sy} ${pt.sx},${pt.sy}`;
    }, "");

    const fillD = `${pathD} L${points[points.length - 1].sx},${svgHeight} L${points[0].sx},${svgHeight} Z`;

    // ✅ FIX: Only render visible (labelled) points to avoid clutter
    const visiblePoints = points.filter(pt => pt.day !== "");

    return (
        <div className="flex-1 w-full h-full flex flex-col pt-4 relative group/chart">
            <div className="flex-1 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-t border-[#FFE2A0] w-full h-0" />
                    ))}
                </div>

                {/* Hover vertical line */}
                {hoveredNode !== null && (
                    <div
                        className="absolute top-0 bottom-0 w-px bg-[#FFE2A0]/20 z-0 transition-all duration-200"
                        style={{ left: `${((points[hoveredNode].sx) / svgWidth) * 100}%` }}
                    />
                )}

                <svg
                    className="w-full h-full relative z-10 overflow-visible"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFE2A0" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#FFE2A0" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <path d={fillD} fill="url(#engagementGradient)" />
                    <path d={pathD} fill="none" stroke="#FFE2A0" strokeWidth="4" strokeLinecap="round" />

                    {points.map((pt, i) => (
                        <g
                            key={i}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredNode(i)}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            <circle cx={pt.sx} cy={pt.sy} r="20" fill="transparent" />
                            <circle
                                cx={pt.sx} cy={pt.sy}
                                r={hoveredNode === i ? "10" : "6"}
                                fill={hoveredNode === i ? "#FFE2A0" : "#3a3a3a"}
                                stroke="#FFE2A0"
                                strokeWidth="3"
                                className="transition-all duration-200"
                            />
                            {hoveredNode !== i && <circle cx={pt.sx} cy={pt.sy} r="2" fill="#FFE2A0" />}
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredNode !== null && (
                    <div
                        className="absolute z-30 bg-[#2d2d2d] border border-[#FFE2A0]/20 rounded-xl p-3 shadow-2xl pointer-events-none transition-all duration-200 -translate-x-1/2 -translate-y-[120%]"
                        style={{
                            left: `${(points[hoveredNode].sx / svgWidth) * 100}%`,
                            top: `${(points[hoveredNode].sy / svgHeight) * 100}%`,
                        }}
                    >
                        <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-widest mb-1">
                            {data[hoveredNode].day || points[hoveredNode].day}
                        </p>
                        <p className="text-white text-lg font-bold">
                            {data[hoveredNode].val.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-[#a0a0a0]">Interactions</span>
                        </p>
                    </div>
                )}
            </div>

            {/* X-axis labels — only show labelled points */}
            <div className="flex justify-between items-center mt-6 px-4 pb-2 border-t border-[#4d4d4d] pt-4">
                {visiblePoints.map((pt, i) => (
                    <span
                        key={i}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                            hoveredNode !== null && points[hoveredNode]?.day === pt.day
                                ? "text-[#FFE2A0]"
                                : "text-[#a0a0a0]"
                        }`}
                    >
                        {pt.day}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ─── Analytics Page ───────────────────────────────────────────────────────────
const Analytics = () => {
    const { user } = useAuth();
    const [timeframe, setTimeframe] = useState("30D");
    const [activeFilter, setActiveFilter] = useState("All");
    const [userListings, setUserListings] = useState<{id: number, name: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<DayPoint[]>([]);
    const [stats, setStats] = useState<StatsState>({
        profileViews: 0,
        totalInteractions: 0,
        listingSaves: 0,
        eventAttendance: 0,
        profileViewsTrend: "—",
        interactionsTrend: "—",
        savesTrend: "—",
        attendanceTrend: "—",
    });

    // ✅ FIX: activeFilter added to useCallback dependencies
    const fetchAnalytics = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);

        const days = timeframeDays[timeframe];
        const currentStart = getDaysAgo(days);
        const previousStart = getDaysAgo(days * 2);

        const { data: listings } = await supabase
            .from("listings")
            .select("id, name")
            .eq("user_id", user.id);

        if (!listings || listings.length === 0) {
            setStats({
                profileViews: 0, totalInteractions: 0, listingSaves: 0, eventAttendance: 0,
                profileViewsTrend: "—", interactionsTrend: "—", savesTrend: "—", attendanceTrend: "—",
            });
            setChartData([]);
            setLoading(false);
            return;
        }
        setUserListings(listings);

        const targetListingIds = activeFilter === "All"
            ? listings.map(l => l.id)
            : [listings.find(l => l.name === activeFilter)?.id].filter(Boolean) as number[];

        if (targetListingIds.length === 0) {
            setStats({
                profileViews: 0, totalInteractions: 0, listingSaves: 0, eventAttendance: 0,
                profileViewsTrend: "—", interactionsTrend: "—", savesTrend: "—", attendanceTrend: "—",
            });
            setChartData([]);
            setLoading(false);
            return;
        }

        const [
            { data: currInteractions },
            { data: prevInteractions },
        ] = await Promise.all([
            supabase
                .from("listing_interactions")
                .select("id, type, created_at")
                .in("listing_id", targetListingIds)
                .gte("created_at", currentStart),
            supabase
                .from("listing_interactions")
                .select("id, type")
                .in("listing_id", targetListingIds)
                .gte("created_at", previousStart)
                .lt("created_at", currentStart),
        ]);

        const currViews   = (currInteractions ?? []).filter((r: any) => r.type === "view").length;
        const currActions = (currInteractions ?? []).filter((r: any) => r.type !== "view").length;
        const prevViews   = (prevInteractions ?? []).filter((r: any) => r.type === "view").length;
        const prevActions = (prevInteractions ?? []).filter((r: any) => r.type !== "view").length;

        const [{ count: currSaves }, { count: prevSaves }] = await Promise.all([
            supabase
                .from("saves")
                .select("id", { count: "exact", head: true })
                .in("listing_id", targetListingIds)
                .gte("created_at", currentStart),
            supabase
                .from("saves")
                .select("id", { count: "exact", head: true })
                .in("listing_id", targetListingIds)
                .gte("created_at", previousStart)
                .lt("created_at", currentStart),
        ]);

        const [{ count: currAttendance }, { count: prevAttendance }] = await Promise.all([
            supabase
                .from("events")
                .select("id", { count: "exact", head: true })
                .in("listing_id", targetListingIds)
                .gte("created_at", currentStart),
            supabase
                .from("events")
                .select("id", { count: "exact", head: true })
                .in("listing_id", targetListingIds)
                .gte("created_at", previousStart)
                .lt("created_at", currentStart),
        ]);

        setStats({
            profileViews: currViews,
            totalInteractions: currActions,
            listingSaves: currSaves ?? 0,
            eventAttendance: currAttendance ?? 0,
            profileViewsTrend: formatTrend(currViews, prevViews),
            interactionsTrend: formatTrend(currActions, prevActions),
            savesTrend: formatTrend(currSaves ?? 0, prevSaves ?? 0),
            attendanceTrend: formatTrend(currAttendance ?? 0, prevAttendance ?? 0),
        });

        // Build chart data
        const grouped: Record<string, number> = {};
        (currInteractions ?? []).forEach((row: any) => {
            const dateKey = new Date(row.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            grouped[dateKey] = (grouped[dateKey] ?? 0) + 1;
        });

        const allDays: DayPoint[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            const skipFactor = days <= 7 ? 1 : days <= 30 ? 5 : days <= 90 ? 10 : 30;
            const showLabel = i % skipFactor === 0 || i === 0 || i === days - 1;

            allDays.push({
                day: showLabel ? label : "",
                val: grouped[label] ?? 0,
                x: 0,
                y: 0,
            });
        }

        setChartData(allDays);
        setLoading(false);
    // ✅ FIX: activeFilter is now in the dependency array
    }, [user?.id, timeframe, activeFilter]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <div className="w-full h-full pb-10">
            {/* Header */}
            <div className="px-4 md:px-6 py-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h1 className="font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide cursor-default">
                            Business <span className="text-[#FFE2A0]">Analytics</span>
                        </h1>
                        <p className="text-white text-sm">Deep dive into your business growth and customer behavior</p>
                    </div>

                    <BusinessFilterDropdown 
                        activeFilter={activeFilter} 
                        onFilterChange={setActiveFilter} 
                        listings={userListings} 
                    />
                </div>

                <div className="flex w-full md:w-fit bg-[#3a3a3a] p-1 rounded-xl border border-[#4d4d4d]">
                    {["7D", "30D", "90D", "1Y"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                timeframe === t
                                    ? "bg-[#FFE2A0] text-[#3a3a3a] shadow-md"
                                    : "text-[#a0a0a0] hover:text-white hover:bg-[#474133]"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 md:px-6 py-6 space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <StatsCard
                        title="Total Profile Views"
                        value={loading ? "—" : stats.profileViews.toLocaleString()}
                        trend={loading ? "—" : stats.profileViewsTrend}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Total Interaction"
                        value={loading ? "—" : stats.totalInteractions.toLocaleString()}
                        trend={loading ? "—" : stats.interactionsTrend}
                        icon={<HiOutlineCursorClick className="size-6 text-[#FFE2A0]" />}
                    />
                    <StatsCard
                        title="Listing Saves"
                        value={loading ? "—" : stats.listingSaves.toLocaleString()}
                        trend={loading ? "—" : stats.savesTrend}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Event Attendance"
                        value={loading ? "—" : stats.eventAttendance.toLocaleString()}
                        trend={loading ? "—" : stats.attendanceTrend}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 9.75h.007v.008H3.75V9.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12.75h.007v.008H3.75V12.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 15.75h.007v.008H3.75V15.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 5.25 4.5Z" />
                            </svg>
                        }
                    />
                </div>

                {/* Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    <div className="lg:col-span-3 bg-[#3a3a3a] border border-[#4d4d4d] rounded-2xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-white text-xl font-semibold">Audience Engagement</h3>
                            {loading && (
                                <svg className="animate-spin h-5 w-5 text-[#FFE2A0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center text-[#a0a0a0] text-sm">
                                Loading engagement data...
                            </div>
                        ) : (
                            <EngagementChart data={chartData} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;