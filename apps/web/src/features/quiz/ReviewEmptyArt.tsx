interface ReviewEmptyArtProps {
  className?: string;
}

/**
 * Animated empty-state illustration for "Ponavljanje".
 * Self-contained: pure inline SVG + CSS keyframes (no deps).
 * All motion is subtle float/twinkle so it feels celebratory ("sve čisto"),
 * and it fully disables itself under prefers-reduced-motion.
 */
export function ReviewEmptyArt({ className = "" }: ReviewEmptyArtProps) {
  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-labelledby="review-empty-title review-empty-desc"
      className={`review-empty-art ${className}`}
    >
      <title id="review-empty-title">Ilustracija prazne liste za ponavljanje</title>
      <desc id="review-empty-desc">
        Tri kartice s točnim odgovorima i zlatna značka s kvačicom — nema grešaka za ponavljanje.
      </desc>

      <style>
        {`
        .review-empty-art .re-box { transform-box: fill-box; transform-origin: center; }
        .review-empty-art .re-float { animation: re-float 4s ease-in-out infinite; }
        .review-empty-art .re-float-soft { animation: re-float-soft 5s ease-in-out infinite; }
        .review-empty-art .re-twinkle { animation: re-twinkle 2.4s ease-in-out infinite; }
        .review-empty-art .re-drift { animation: re-drift 3.2s ease-in-out infinite; }
        .review-empty-art .re-pop { animation: re-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .review-empty-art .re-draw { stroke-dasharray: 30; stroke-dashoffset: 30; animation: re-draw 0.6s ease-out 0.45s forwards; }
        .review-empty-art .re-ping { animation: re-ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .review-empty-art .re-shadow { animation: re-shadow 4s ease-in-out infinite; }
        @keyframes re-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes re-float-soft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes re-twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.12) rotate(10deg); } }
        @keyframes re-drift { 0% { transform: translateY(6px); opacity: 0; } 25% { opacity: 0.9; } 100% { transform: translateY(-14px); opacity: 0; } }
        @keyframes re-pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes re-draw { to { stroke-dashoffset: 0; } }
        @keyframes re-ping { 0% { transform: scale(0.85); opacity: 0.5; } 75%, 100% { transform: scale(1.55); opacity: 0; } }
        @keyframes re-shadow { 0%, 100% { opacity: 0.16; transform: scaleX(1); } 50% { opacity: 0.26; transform: scaleX(0.92); } }
        @media (prefers-reduced-motion: reduce) {
          .review-empty-art * { animation: none !important; }
          .review-empty-art .re-draw { stroke-dashoffset: 0 !important; }
        }
        `}
      </style>

      <defs>
        <linearGradient id="re-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDF4FF" />
          <stop offset="100%" stopColor="#F5EAF9" />
        </linearGradient>
        <linearGradient id="re-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#AD45D1" />
          <stop offset="100%" stopColor="#835B92" />
        </linearGradient>
        <radialGradient id="re-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#AD45D1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#AD45D1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* backdrop */}
      <rect x="24" y="12" width="272" height="216" rx="28" fill="url(#re-bg)" />
      <rect x="24" y="12" width="272" height="216" rx="28" fill="none" stroke="#F3E8FF" strokeWidth="1.5" />
      <ellipse cx="160" cy="140" rx="105" ry="78" fill="url(#re-glow)" />

      {/* dotted texture */}
      <g fill="#B08BBE" opacity="0.35">
        <circle cx="52" cy="44" r="2" />
        <circle cx="66" cy="44" r="2" />
        <circle cx="80" cy="44" r="2" />
        <circle cx="240" cy="200" r="2" />
        <circle cx="254" cy="200" r="2" />
        <circle cx="268" cy="200" r="2" />
      </g>

      {/* ground shadow */}
      <ellipse cx="160" cy="210" rx="72" ry="10" fill="#835B92" className="re-box re-shadow" />

      {/* floating deck */}
      <g className="re-box re-float">
        {/* back-left card */}
        <g transform="rotate(-10 160 135)">
          <rect x="95" y="75" width="120" height="130" rx="16" fill="#EDE0F5" stroke="#B08BBE" strokeWidth="1.5" />
          <rect x="109" y="93" width="92" height="10" rx="5" fill="#D9BFE6" opacity="0.8" />
          <rect x="109" y="111" width="70" height="8" rx="4" fill="#D9BFE6" opacity="0.55" />
          <rect x="109" y="127" width="80" height="8" rx="4" fill="#D9BFE6" opacity="0.55" />
        </g>
        {/* back-right card */}
        <g transform="rotate(10 160 135)">
          <rect x="100" y="72" width="120" height="130" rx="16" fill="#F3E8FF" stroke="#D8BFE6" strokeWidth="1.5" />
          <rect x="114" y="90" width="92" height="10" rx="5" fill="#E3CDEF" opacity="0.9" />
          <rect x="114" y="108" width="64" height="8" rx="4" fill="#E3CDEF" opacity="0.6" />
        </g>

        {/* front card */}
        <g className="re-box re-float-soft" style={{ animationDelay: "0.6s" }}>
          <rect x="100" y="62" width="120" height="140" rx="18" fill="#ffffff" stroke="#E9D5FF" strokeWidth="2" />
          {/* header pill */}
          <rect x="116" y="78" width="88" height="18" rx="9" fill="#F5EAF9" />
          <circle cx="128" cy="87" r="5" fill="#AD45D1" opacity="0.85" />
          <path d="M125.8 87l1.6 1.6 3-3.2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="138" y="84" width="52" height="6" rx="3" fill="#B08BBE" opacity="0.7" />

          {/* row 1 */}
          <circle cx="124" cy="114" r="9" fill="#DCFCE7" />
          <path d="M120.5 114l2.5 2.5 4.8-5.2" stroke="#16A34A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="140" y="110" width="60" height="8" rx="4" fill="#E5E7EB" />
          {/* row 2 */}
          <circle cx="124" cy="140" r="9" fill="#DCFCE7" />
          <path d="M120.5 140l2.5 2.5 4.8-5.2" stroke="#16A34A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="140" y="136" width="48" height="8" rx="4" fill="#E5E7EB" />
          {/* row 3 */}
          <circle cx="124" cy="166" r="9" fill="#DCFCE7" />
          <path d="M120.5 166l2.5 2.5 4.8-5.2" stroke="#16A34A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="140" y="162" width="56" height="8" rx="4" fill="#E5E7EB" />

          {/* bottom progress pill */}
          <rect x="122" y="182" width="76" height="12" rx="6" fill="#AD45D1" opacity="0.14" />
          <rect x="122" y="182" width="76" height="12" rx="6" fill="none" stroke="#AD45D1" strokeWidth="1" opacity="0.3" />
          <rect x="126" y="185.5" width="44" height="5" rx="2.5" fill="#AD45D1" opacity="0.75" />
        </g>
      </g>

      {/* success badge */}
      <g className="re-box re-pop">
        <circle cx="218" cy="64" r="26" fill="#AD45D1" opacity="0.18" className="re-box re-ping" />
        <circle cx="218" cy="64" r="20" fill="url(#re-badge)" stroke="#ffffff" strokeWidth="4" />
        <path d="M209.5 64.5l6 6 12-13" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="re-draw" />
      </g>

      {/* twinkling sparkles */}
      <g className="re-box re-twinkle" style={{ animationDelay: "0.2s" }}>
        <path d="M58 62l2.2 5.6 5.6 2.2-5.6 2.2-2.2 5.6-2.2-5.6-5.6-2.2 5.6-2.2Z" fill="#FBBF24" />
      </g>
      <g className="re-box re-twinkle" style={{ animationDelay: "1.1s" }}>
        <path d="M264 66l2.6 6.6 6.6 2.6-6.6 2.6-2.6 6.6-2.6-6.6-6.6-2.6 6.6-2.6Z" fill="#AD45D1" />
      </g>
      <g className="re-box re-twinkle" style={{ animationDelay: "1.7s" }}>
        <path d="M48 148l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8Z" fill="#835B92" />
      </g>
      <g className="re-box re-twinkle" style={{ animationDelay: "0.7s" }}>
        <path d="M272 148l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8Z" fill="#FBBF24" />
      </g>

      {/* drifting confetti dots */}
      <g className="re-box re-drift" style={{ animationDelay: "0s" }}>
        <circle cx="80" cy="120" r="3.5" fill="#AD45D1" opacity="0.55" />
      </g>
      <g className="re-box re-drift" style={{ animationDelay: "1s" }}>
        <circle cx="242" cy="128" r="3" fill="#F59E0B" opacity="0.65" />
      </g>
      <g className="re-box re-drift" style={{ animationDelay: "2s" }}>
        <circle cx="160" cy="38" r="2.5" fill="#835B92" opacity="0.6" />
      </g>
      <g className="re-box re-drift" style={{ animationDelay: "1.5s" }}>
        <rect x="90" y="168" width="10" height="4" rx="2" fill="#16A34A" opacity="0.5" transform="rotate(-20 95 170)" />
      </g>
      <g className="re-box re-drift" style={{ animationDelay: "2.4s" }}>
        <rect x="222" y="172" width="10" height="4" rx="2" fill="#AD45D1" opacity="0.5" transform="rotate(20 227 174)" />
      </g>
    </svg>
  );
}
