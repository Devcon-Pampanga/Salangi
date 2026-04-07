import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

const getBadgeStyle = (trend: string) => {
  if (trend.startsWith('+') || trend.toLowerCase().includes('new')) {
    return 'text-green-400 bg-green-400/10';
  }
  if (trend.startsWith('-')) {
    return 'text-red-400 bg-red-400/10';
  }
  return 'text-[#FFE2A0] bg-[#FFE2A0]/10';
};

const StatsCard = ({ title, value, trend, icon }: StatsCardProps) => (
  <div className="bg-[#3a3a3a] border border-[#4d4d4d] rounded-2xl p-6 transition-all hover:border-[#5a5241] group">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-[#474133] p-3 rounded-xl border border-[#5a5241] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getBadgeStyle(trend)}`}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-[#a0a0a0] text-sm font-light mb-1">{title}</p>
      <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  </div>
);

export default StatsCard;