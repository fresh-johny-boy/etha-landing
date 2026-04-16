"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: "SHOP", href: "#" },
  { label: "ACADEMY", href: "#academy" },
  { label: "OUR STORY", href: "#" },
  { label: "BLOG", href: "#" },
  { label: "CONTACT", href: "#" },
];

const socialLinks = [
  { label: "INSTAGRAM", href: "#" },
  { label: "PINTEREST", href: "#" },
  { label: "YOUTUBE", href: "#" },
];

export default function Footer(): React.ReactElement {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.from(contentRef.current.children, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
          },
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-aubergine px-6 py-16 md:px-12 md:py-20">
      <div ref={contentRef} className="mx-auto max-w-6xl">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/etha-logo-light.webp`}
            alt="ETHA"
            width={100}
            height={32}
            className="h-auto w-[80px] opacity-80 md:w-[100px]"
          />
        </div>

        {/* Nav links */}
        <nav className="mb-10 flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-label text-[10px] text-cream/50 transition-opacity duration-300 hover:text-cream/80"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-auto mb-10 h-[1px] max-w-3xl bg-cream/10" />

        {/* Bottom row: social + newsletter */}
        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-10 md:flex-row md:justify-between">
          {/* Social */}
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-label text-[9px] text-cream/40 transition-opacity duration-300 hover:text-cream/70"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-3 font-serif text-[13px] font-light text-cream/50">
              Subscribe to our journey
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-[200px] border border-cream/20 bg-transparent px-4 py-2.5 font-serif text-[14px] font-light text-cream placeholder:font-serif placeholder:text-[13px] placeholder:italic placeholder:text-cream/25 focus:border-cream/40 focus:outline-none md:w-[240px]"
              />
              <button
                type="button"
                className="font-label border border-l-0 border-cream/20 px-4 py-2.5 text-[10px] text-cream/50 transition-colors duration-300 hover:bg-cream/[0.06] hover:text-cream/80"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto mb-8 h-[1px] max-w-3xl bg-cream/10" />

        {/* Legal row */}
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-label text-[9px] text-cream/30">
            &copy; 2026 ETHA
          </p>
          <div className="flex gap-6">
            {["PRIVACY", "TERMS", "COOKIES"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-label text-[9px] text-cream/30 transition-opacity duration-300 hover:text-cream/50"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Element marque — quiet closing signature */}
        <div className="mt-10 flex justify-center">
          <span className="font-serif text-xl text-cream/15">~</span>
        </div>
      </div>
    </footer>
  );
}
