import Image from "next/image";

export default function LoneAlphaBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex justify-center items-center ${className}`}>
      <a
        href="https://malik-saad-ahmed-awan.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        title="View Saad Ahmed's profile — LoneAlpha"
        className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F7F6F1] border border-[#DEDCCF] hover:border-[#C5A059] shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-[#344C49]"
      >
        <span className="text-[11px] tracking-wide text-[#516D6A] font-medium leading-none">
          Powered by
        </span>
        <span className="w-px h-3.5 bg-[#DEDCCF]" />
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5 rounded-full bg-white ring-1 ring-[#193A38]/20 group-hover:ring-[#C5A059] shadow-2xs flex items-center justify-center p-0.5 transition-all duration-300 shrink-0">
            <Image
              src="/brand/lone-alpha.png"
              alt="LoneAlpha Logo"
              width={20}
              height={20}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-[#193A38] group-hover:text-[#C5A059] transition-colors leading-none">
            LoneAlpha
          </span>
          <svg
            className="w-3.5 h-3.5 text-[#516D6A] group-hover:text-[#C5A059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </a>
    </div>
  );
}
