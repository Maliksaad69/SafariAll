export default function LoneAlphaBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex justify-center items-center ${className}`}>
      <a
        href="https://malik-saad-ahmed-awan.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        title="View Saad Ahmed's profile — LoneAlpha"
        className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#163332]/85 hover:bg-[#122A29] border border-white/10 hover:border-[#C5A059]/60 shadow-xs hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5),0_0_16px_rgba(197,160,89,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 backdrop-blur-md"
      >
        <span className="text-xs sm:text-[13px] tracking-wide text-white/70 group-hover:text-white/95 font-medium leading-none transition-colors">
          Powered by
        </span>
        <span className="w-px h-4 bg-white/15 group-hover:bg-[#C5A059]/50 transition-colors" />
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Natural dark wolf vessel with subtle gold aura */}
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0E1F1E] border border-white/10 group-hover:border-[#C5A059]/60 shadow-inner flex items-center justify-center p-1 transition-all duration-300 shrink-0 group-hover:shadow-[0_0_10px_rgba(197,160,89,0.4)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              aria-label="LoneAlpha Wolf Emblem"
            >
              <defs>
                <linearGradient id="loneAlphaWolfGold" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#C5A059" />
                  <stop offset="100%" stopColor="#926F28" />
                </linearGradient>
                <linearGradient id="loneAlphaWolfLight" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="100%" stopColor="#E4C176" />
                </linearGradient>
              </defs>

              {/* Left Ear */}
              <path d="M4 2.5L9 8L3.5 10.5L4 2.5Z" fill="url(#loneAlphaWolfGold)" />
              <path d="M5 4.5L8.2 8L4.8 9.5L5 4.5Z" fill="url(#loneAlphaWolfLight)" opacity="0.9" />

              {/* Right Ear */}
              <path d="M20 2.5L15 8L20.5 10.5L20 2.5Z" fill="url(#loneAlphaWolfGold)" />
              <path d="M19 4.5L15.8 8L19.2 9.5L19 4.5Z" fill="url(#loneAlphaWolfLight)" opacity="0.9" />

              {/* Forehead Crown */}
              <path d="M12 4.5L9 8L12 12L15 8L12 4.5Z" fill="url(#loneAlphaWolfLight)" />

              {/* Brow & Temples */}
              <path d="M9 8L3.5 10.5L7.5 12.5L12 12L9 8Z" fill="url(#loneAlphaWolfGold)" opacity="0.9" />
              <path d="M15 8L20.5 10.5L16.5 12.5L12 12L15 8Z" fill="url(#loneAlphaWolfGold)" opacity="0.8" />

              {/* Cheek Tufts Left */}
              <path d="M3.5 10.5L1.5 14L6 14.5L7.5 12.5L3.5 10.5Z" fill="url(#loneAlphaWolfGold)" opacity="0.85" />
              <path d="M1.5 14L4 18L7.5 16.5L6 14.5L1.5 14Z" fill="url(#loneAlphaWolfGold)" opacity="0.75" />

              {/* Cheek Tufts Right */}
              <path d="M20.5 10.5L22.5 14L18 14.5L16.5 12.5L20.5 10.5Z" fill="url(#loneAlphaWolfGold)" opacity="0.85" />
              <path d="M22.5 14L20 18L16.5 16.5L18 14.5L22.5 14Z" fill="url(#loneAlphaWolfGold)" opacity="0.75" />

              {/* Eyes - Keen Alpha Slits */}
              <polygon points="7.2,12.2 10.2,12.6 8.5,13.6" fill="#0E1F1E" />
              <polygon points="7.8,12.4 9.6,12.7 8.7,13.3" fill="#FFFBEB" />

              <polygon points="16.8,12.2 13.8,12.6 15.5,13.6" fill="#0E1F1E" />
              <polygon points="16.2,12.4 14.4,12.7 15.3,13.3" fill="#FFFBEB" />

              {/* Snout Bridge */}
              <path d="M12 12L9.5 14L10.8 18.5L12 18.5L12 12Z" fill="url(#loneAlphaWolfLight)" />
              <path d="M12 12L14.5 14L13.2 18.5L12 18.5L12 12Z" fill="url(#loneAlphaWolfGold)" opacity="0.9" />

              {/* Muzzle Cheeks */}
              <path d="M9.5 14L7.5 16.5L10.8 18.5L9.5 14Z" fill="url(#loneAlphaWolfGold)" opacity="0.8" />
              <path d="M14.5 14L16.5 16.5L13.2 18.5L14.5 14Z" fill="url(#loneAlphaWolfGold)" opacity="0.7" />

              {/* Jaw & Chin Flanks */}
              <path d="M7.5 16.5L10.5 21L12 18.5L10.8 18.5L7.5 16.5Z" fill="url(#loneAlphaWolfGold)" opacity="0.85" />
              <path d="M16.5 16.5L13.5 21L12 18.5L13.2 18.5L16.5 16.5Z" fill="url(#loneAlphaWolfGold)" opacity="0.75" />

              {/* Nose Tip */}
              <polygon points="10.8,18.5 13.2,18.5 12,20.2" fill="#0E1F1E" />

              {/* Chin Tip */}
              <polygon points="10.5,20.8 13.5,20.8 12,22.2" fill="url(#loneAlphaWolfLight)" />
            </svg>
          </div>
          <span className="text-xs sm:text-[14px] font-black tracking-wider uppercase text-white group-hover:text-[#E4DBB4] transition-colors leading-none">
            LoneAlpha
          </span>
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 group-hover:text-[#C5A059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </a>
    </div>
  );
}
