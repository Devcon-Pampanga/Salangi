const BetaBadge = () => {
  return (
    <span
      title="This feature is in beta."
      className="
        inline-flex items-center
        px-2 py-0.5 ml-2
        text-[10px] font-bold tracking-wide
        text-orange-700
        bg-orange-50
        border border-orange-400
        rounded-full
        shadow-sm
        cursor-default
        select-none
        hover:bg-orange-100
        transition-colors duration-200
        align-middle
        whitespace-nowrap
      "
    >
      Beta
    </span>
  );
};

export default BetaBadge;