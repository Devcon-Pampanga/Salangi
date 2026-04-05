import { useState } from "react";
import { HiOutlineCursorClick } from "react-icons/hi"
import StatsCard from "./StatsCard";



const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4 relative">
        <div className="bg-[#474133] p-4 rounded-full border border-[#5a5241] shadow-inner mb-2 relative z-10 shadow-black/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" className="size-10 text-[#FFE2A0]">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
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

const ProperEngagementChart = () => {
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);

    const data = [
        { day: 'Mon', val: 124, x: 50, y: 320 },
        { day: 'Tue', val: 182, x: 200, y: 280 },
        { day: 'Wed', val: 156, x: 350, y: 300 },
        { day: 'Thu', val: 342, x: 500, y: 150 },
        { day: 'Fri', val: 284, x: 650, y: 180 },
        { day: 'Sat', val: 492, x: 800, y: 60 },
        { day: 'Sun', val: 412, x: 950, y: 110 }
    ];

    return (
        <div className="flex-1 w-full h-full flex flex-col pt-4 relative group/chart">
            <div className="flex-1 relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-t border-[#FFE2A0] w-full h-0" />
                    ))}
                </div>
                
                {/* Interaction Hover Line */}
                {hoveredNode !== null && (
                    <div 
                        className="absolute top-0 bottom-0 w-px bg-[#FFE2A0]/20 z-0 transition-all duration-200"
                        style={{ left: `${(data[hoveredNode].x / 1000) * 100}%` }}
                    />
                )}

                {/* The Chart Path */}
                <svg className="w-full h-full relative z-10 overflow-visible px-4" viewBox="0 0 1000 400" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFE2A0" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#FFE2A0" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Background Fill */}
                    <path 
                        d="M0,320 C80,320 120,280 200,280 C280,280 300,300 350,300 C400,300 450,150 500,150 C550,150 600,180 650,180 C700,180 750,60 800,60 C850,60 900,110 1000,110 V400 H0 Z" 
                        fill="url(#engagementGradient)" 
                    />
                    
                    {/* Main Line */}
                    <path 
                        d="M0,320 C80,320 120,280 200,280 C280,280 300,300 350,300 C400,300 450,150 500,150 C550,150 600,180 650,180 C700,180 750,60 800,60 C850,60 900,110 1000,110" 
                        fill="none" 
                        stroke="#FFE2A0" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                    />
                    
                    {/* Interactive Data Nodes */}
                    {data.map((node, i) => (
                        <g 
                            key={i} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredNode(i)}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            <circle cx={node.x} cy={node.y} r="20" fill="transparent" />
                            <circle 
                                cx={node.x} cy={node.y} 
                                r={hoveredNode === i ? "10" : "6"} 
                                fill={hoveredNode === i ? "#FFE2A0" : "#3a3a3a"} 
                                stroke="#FFE2A0" 
                                strokeWidth="3" 
                                className="transition-all duration-200"
                            />
                            {hoveredNode !== i && <circle cx={node.x} cy={node.y} r="2" fill="#FFE2A0" />}
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredNode !== null && (
                    <div 
                        className="absolute z-30 bg-[#2d2d2d] border border-[#FFE2A0]/20 rounded-xl p-3 shadow-2xl pointer-events-none transition-all duration-200 -translate-x-1/2 -translate-y-[120%]"
                        style={{ 
                            left: `${(data[hoveredNode].x / 1000) * 100}%`,
                            top: `${(data[hoveredNode].y / 400) * 100}%`
                        }}
                    >
                        <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-widest mb-1">{data[hoveredNode].day}</p>
                        <p className="text-white text-lg font-bold">{data[hoveredNode].val.toLocaleString()} <span className="text-xs font-normal text-[#a0a0a0]">Interactions</span></p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-6 px-4 pb-2 border-t border-[#4d4d4d] pt-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <span 
                        key={day} 
                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                            hoveredNode === i ? 'text-[#FFE2A0]' : 'text-[#a0a0a0]'
                        }`}
                    >
                        {day}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Analytics = () => {
    const [timeframe, setTimeframe] = useState("30D");
    const [hasData, setHasData] = useState(true);

    return (
        <div className="w-full h-full pb-10">
            {/* Header */}
            <div className="px-6 py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-['Playfair_Display'] text-white text-3xl font-semibold tracking-wide cursor-default">
                        Business <span className="text-[#FFE2A0]">Analytics</span>
                    </h1>
                    <p className="text-white text-sm">Deep dive into your business growth and customer behavior</p>
                </div>

                {/* Date Selector -> depending on the timeframe the KPIs and graph will change*/}
                <div className="flex bg-[#3a3a3a] p-1 rounded-xl border border-[#4d4d4d]">
                    {['7D', '30D', '90D', '1Y'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                timeframe === t 
                                ? 'bg-[#FFE2A0] text-[#3a3a3a] shadow-md' 
                                : 'text-[#a0a0a0] hover:text-white hover:bg-[#474133]'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 py-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                    {/* Total Profile Views -> amount of people who clicked the business */}
                    <StatsCard 
                        title="Total Profile Views" 
                        value="12,482" 
                        trend="+14.2%" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}
                    />

                    {/* Total Interaction -> amount of people who interacted with the business by clicking the phone number button, website button, and/or facebook button*/}
                    <StatsCard 
                        title="Total Interaction" 
                        value="843" 
                        trend="+5.7%" 
                        icon={<HiOutlineCursorClick className="size-6 text-[#FFE2A0]" />}
                    />

                    {/* Listing Saves -> amount of people who saved (liked) the listing*/}
                    <StatsCard 
                        title="Listing Saves" 
                        value="3,210" 
                        trend="+22.1%" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>}
                    />

                    {/* Event Attendance -> amount of people who attended the event the business owner created*/}
                    <StatsCard 
                        title="Event Attendance" 
                        value="1,142" 
                        trend="+8.4%" 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-[#FFE2A0]"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 9.75h.007v.008H3.75V9.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12.75h.007v.008H3.75V12.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 15.75h.007v.008H3.75V15.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 5.25 4.5Z" /></svg>}
                    />
                </div>

                {/* Main Content Area: Charts & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

                    {/* This chart is for all the interaction (on the KPIs) based on date. */}
                    {/* Placeholder for Chart */}
                    <div className="lg:col-span-3 bg-[#3a3a3a] border border-[#4d4d4d] rounded-2xl p-6 min-h-[400px] flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-white text-xl font-semibold">Audience Engagement</h3>
                        </div>
                        
                        {hasData ? (
                            <ProperEngagementChart />
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
