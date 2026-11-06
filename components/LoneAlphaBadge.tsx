import Image from "next/image";

export default function LoneAlphaBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex justify-center items-center ${className}`}>
      <a
        href="https://malik-saad-ahmed-awan.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        title="View Saad Ahmed's profile — LoneAlpha"
        className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-white via-[#FCFAF7] to-white hover:from-white hover:via-[#FAF5EB] hover:to-white border border-[#DEDCCF]/90 hover:border-[#C5A059] shadow-xs hover:shadow-[0_8px_24px_-4px_rgba(197,160,89,0.32),0_2px_8px_-2px_rgba(25,58,56,0.08)] ring-1 ring-black/5 hover:ring-[#C5A059]/40 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 text-[#344C49]"
      >
        <span className="text-xs sm:text-[13px] tracking-wide text-[#516D6A] font-medium leading-none">
          Powered by
        </span>
        <span className="w-px h-4 bg-[#DEDCCF] group-hover:bg-[#C5A059]/50 transition-colors" />
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white ring-1.5 ring-[#C5A059]/40 group-hover:ring-[#C5A059] shadow-2xs group-hover:shadow-[0_0_12px_rgba(197,160,89,0.4)] flex items-center justify-center p-0.5 transition-all duration-300 shrink-0">
            <Image
              src="/brand/lone-alpha.png"
              alt="LoneAlpha Logo"
              width={28}
              height={28}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="text-xs sm:text-[14px] font-black tracking-wider uppercase text-[#193A38] group-hover:text-[#C5A059] transition-colors leading-none">
            LoneAlpha
          </span>
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#516D6A] group-hover:text-[#C5A059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0"
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
