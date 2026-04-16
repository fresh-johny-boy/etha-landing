"use client";

import Image from "next/image";

export default function Nav(): React.ReactElement {
  return (
    <nav className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
      {/* Left — RITUALS */}
      <a
        href="#"
        className="font-label text-[11px] text-aubergine/70 transition-opacity hover:opacity-60"
      >
        RITUALS
      </a>

      {/* Center — Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/etha-logo-dark.svg`}
          alt="ĒTHA"
          width={100}
          height={32}
          preload
          className="h-auto w-[80px] md:w-[100px]"
        />
      </div>

      {/* Right — YOUR REPORTS */}
      <a
        href="#"
        className="font-label text-[11px] text-aubergine/70 transition-opacity hover:opacity-60"
      >
        YOUR REPORTS
      </a>
    </nav>
  );
}
