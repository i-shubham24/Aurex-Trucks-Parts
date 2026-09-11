function Mark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="aurexBadge" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B35" />
          <stop offset="0.55" stopColor="#E53E00" />
          <stop offset="1" stopColor="#C23400" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="11" fill="url(#aurexBadge)" />
      {/* chevron A */}
      <path d="M22 9L32 27H26.6L22 18.4L17.4 27H12L22 9Z" fill="white" />
      {/* axle bar */}
      <rect x="12" y="28.5" width="20" height="2.6" rx="1.3" fill="white" />
      {/* wheels */}
      <circle cx="15.5" cy="34.5" r="2.4" fill="white" />
      <circle cx="28.5" cy="34.5" r="2.4" fill="white" />
      <circle cx="15.5" cy="34.5" r="0.9" fill="#C23400" />
      <circle cx="28.5" cy="34.5" r="0.9" fill="#C23400" />
    </svg>
  );
}

export function LogoFull({ className = "", light = false }) {
  return (
    <span className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <Mark />
      <span className="leading-none">
        <span className={`block font-black tracking-tight text-[19px] ${light ? "text-white" : "text-[#1A1A2E]"}`} style={{ fontFamily: "Space Grotesk" }}>
          AUREX <span className="text-[#FF6B35]">TRUCK</span>
        </span>
        <span className={`block text-[10px] tracking-[0.26em] font-semibold mt-0.5 ${light ? "text-white/50" : "text-[#6B7280]"}`}>
          PARTS · AUSTRALIA
        </span>
      </span>
    </span>
  );
}

export function LogoCompact({ className = "", size = 40 }) {
  return <Mark size={size} />;
}
