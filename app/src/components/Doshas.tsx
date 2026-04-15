"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuraButton from "./AuraButton";

gsap.registerPlugin(ScrollTrigger);

const doshas = [
  {
    name: "Vata",
    elements: "Ether + Air",
    subtitle: "Seeks grounding and warmth",
    essence: "The energy of movement",
    description:
      "It governs breath, circulation, and the nervous system. When balanced, it manifests as creativity, vitality, light sleep, and effortless flow.",
    color: "vata",
    accentColor: "#F5A800",
    lightColor: "#86C4FB",
    offset: "-translate-y-8 md:-translate-y-12",
    // Energised aura — angular, restless, self-crossing
    auraPath:
      "M85,25 C110,8 155,12 170,35 C185,58 160,72 140,60 C120,48 145,30 165,45 C185,60 175,90 150,100 C125,110 90,105 70,88 C50,71 45,48 60,32 C68,24 78,22 85,25",
    auraViewBox: "0 0 220 130",
  },
  {
    name: "Pitta",
    elements: "Fire + Water",
    subtitle: "Seeks cooling and calm",
    essence: "The energy of transformation",
    description:
      "It governs digestion, metabolism, and intelligence. When balanced, it manifests as sharp focus, strong digestion, warmth, and decisiveness.",
    color: "pitta",
    accentColor: "#A2E8F2",
    lightColor: "#FF5C3A",
    offset: "",
    // Balanced aura — smooth organic oval
    auraPath:
      "M110,12 C155,8 195,25 210,55 C225,85 205,115 170,128 C135,141 90,140 60,125 C30,110 10,85 15,55 C20,25 65,16 110,12",
    auraViewBox: "0 0 230 150",
  },
  {
    name: "Kapha",
    elements: "Earth + Water",
    subtitle: "Seeks stimulation and lightness",
    essence: "The energy of structure",
    description:
      "It governs stability, hydration, and physical endurance. When balanced, it manifests as calm emotions, loyalty, and steady strength.",
    color: "kapha",
    accentColor: "#FFB3A5",
    lightColor: "#6BCDB2",
    offset: "translate-y-8 md:translate-y-12",
    // Relaxed aura — flowing blob, soft curves, wider
    auraPath:
      "M120,15 C160,10 200,30 215,60 C230,90 220,120 195,140 C170,160 130,165 100,155 C70,145 40,125 25,100 C10,75 15,45 35,28 C55,11 80,20 120,15",
    auraViewBox: "0 0 245 175",
  },
];

export default function Doshas(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Diagram animation
      if (diagramRef.current) {
        gsap.from(diagramRef.current, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: diagramRef.current,
            start: "top 80%",
          },
        });
      }

      // Dosha cards stagger in
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const directions = [-40, 0, 40];
        gsap.from(card, {
          x: directions[i],
          y: 40,
          opacity: 0,
          duration: 1,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });

        // Aura breathing animation
        const aura = card.querySelector(".dosha-aura");
        if (aura) {
          gsap.to(aura, {
            scale: 1.03,
            duration: 5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream px-6 py-24 md:px-12 md:py-32"
    >
      {/* Section header */}
      <div className="mx-auto max-w-3xl pb-16 md:pb-24">
        <p className="mb-4 font-serif text-sm italic text-aubergine/50">
          — The Three Doshas
        </p>
        <h2 className="mb-6 font-serif text-[clamp(1.75rem,4.5vw,3rem)] font-semibold leading-[1.1] text-aubergine">
          Know your Dosha,
          <br />
          know yourself
        </h2>
        <p className="max-w-lg font-serif text-[15px] font-light leading-[1.6] text-aubergine/60">
          In Ayurveda, the five elements combine to form three Doshas. Knowing
          your Dosha shows you what works for you — how to eat, move, rest, and
          feel more like yourself.
        </p>
      </div>

      {/* Elements → Doshas diagram */}
      <div
        ref={diagramRef}
        className="mx-auto mb-16 flex max-w-2xl items-center justify-center gap-8 md:mb-24 md:gap-16"
      >
        {/* Elements side */}
        <div className="flex flex-col gap-2 text-right">
          {["Earth", "Water", "Fire", "Air", "Ether"].map((el) => (
            <p
              key={el}
              className="font-serif text-[13px] italic text-aubergine/50"
            >
              {el}
            </p>
          ))}
        </div>

        {/* Connecting visual */}
        <div className="flex flex-col items-center">
          <svg
            width="60"
            height="120"
            viewBox="0 0 60 120"
            fill="none"
            aria-hidden="true"
          >
            {/* Five lines converging to three points */}
            <path
              d="M0,10 C30,10 30,24 60,24"
              stroke="rgba(61,35,59,0.15)"
              strokeWidth="0.75"
            />
            <path
              d="M0,30 C30,30 30,24 60,24"
              stroke="rgba(61,35,59,0.15)"
              strokeWidth="0.75"
            />
            <path
              d="M0,50 C30,50 30,60 60,60"
              stroke="rgba(61,35,59,0.15)"
              strokeWidth="0.75"
            />
            <path
              d="M0,70 C30,70 30,60 60,60"
              stroke="rgba(61,35,59,0.15)"
              strokeWidth="0.75"
            />
            <path
              d="M0,90 C30,90 30,96 60,96"
              stroke="rgba(61,35,59,0.15)"
              strokeWidth="0.75"
            />
            <path
              d="M0,110 C30,110 30,96 60,96"
              stroke="rgba(61,35,59,0.15)"
              strokeWidth="0.75"
            />
          </svg>
        </div>

        {/* Doshas side */}
        <div className="flex flex-col justify-between" style={{ height: 120 }}>
          {doshas.map((d) => (
            <p
              key={d.name}
              className="font-serif text-[13px] italic text-aubergine/70"
            >
              {d.name}
            </p>
          ))}
        </div>
      </div>

      {/* Three Dosha panels — staggered */}
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3 md:gap-12">
        {doshas.map((dosha, i) => (
          <div
            key={dosha.name}
            ref={(node) => {
              cardsRef.current[i] = node;
            }}
            className={`relative flex flex-col items-center text-center ${dosha.offset}`}
          >
            {/* Dosha-specific aura — background decoration */}
            <svg
              className="dosha-aura pointer-events-none absolute -top-8 left-1/2 z-0 h-[280px] w-[280px] -translate-x-1/2 overflow-visible md:h-[320px] md:w-[320px]"
              viewBox={dosha.auraViewBox}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path
                d={dosha.auraPath}
                stroke={dosha.accentColor}
                strokeWidth="1.2"
                strokeOpacity="0.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>

            {/* Color halo */}
            <div
              className="absolute -top-4 left-1/2 z-0 h-[200px] w-[200px] -translate-x-1/2 rounded-full opacity-[0.08] blur-3xl"
              style={{ backgroundColor: dosha.lightColor }}
            />

            {/* Image placeholder */}
            <div className="relative z-10 mb-6 h-[240px] w-[200px] overflow-hidden md:h-[280px] md:w-[220px]">
              <div className="absolute inset-0 bg-gradient-to-b from-aubergine/[0.06] via-aubergine/[0.02] to-aubergine/[0.05]" />
              <p className="font-label absolute bottom-3 left-3 text-[8px] text-aubergine/20">
                {dosha.name} portrait
              </p>
            </div>

            {/* Dosha info */}
            <div className="relative z-10">
              <h3 className="mb-1 font-serif text-2xl font-semibold text-aubergine md:text-[28px]">
                {dosha.name}
              </h3>
              <p className="mb-2 font-serif text-[13px] italic text-aubergine/50">
                {dosha.elements}
              </p>
              <p className="mb-2 font-serif text-[15px] font-semibold text-aubergine/80">
                {dosha.essence}
              </p>
              <p className="mb-2 max-w-[260px] font-serif text-[14px] font-light leading-[1.6] text-aubergine/60">
                {dosha.description}
              </p>
              <p className="font-serif text-[12px] italic text-aubergine/40">
                {dosha.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom text + CTA */}
      <p className="mx-auto mt-16 max-w-md text-center font-serif text-[15px] font-light italic leading-[1.6] text-aubergine/60 md:mt-20">
        Everyone carries all three Doshas. What differs is which one leads.
      </p>
      <div className="mt-8 hidden justify-center md:mt-10 md:flex">
        <AuraButton href="#quiz" className="text-aubergine">
          DISCOVER YOUR DOSHA
        </AuraButton>
      </div>
    </section>
  );
}
