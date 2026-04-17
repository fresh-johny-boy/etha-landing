"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlobImage from "./BlobImage";
import {
  SHAPE_FIRE,
  SHAPE_EARTH,
  SHAPE_SPACE,
  SHAPE_AIR,
  SHAPE_WATER,
} from "./auraShapes";

gsap.registerPlugin(ScrollTrigger);

const elements = [
  {
    name: "Fire",
    tagline: "Heat. Transformation. The spark that changes everything.",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/fire.webp`,
    imageStyle: { objectPosition: "center 40%" },
    shape: SHAPE_FIRE,
    align: "left" as const,
  },
  {
    name: "Earth",
    tagline: "Weight. Foundation. The ground beneath everything.",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/earth.webp`,
    imageStyle: { objectPosition: "center center" },
    shape: SHAPE_EARTH,
    align: "right" as const,
  },
  {
    name: "Space",
    tagline: "Space. Connection. The source from which everything flows.",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/space.webp`,
    imageStyle: { objectPosition: "center center" },
    shape: SHAPE_SPACE,
    align: "left" as const,
  },
  {
    name: "Air",
    tagline: "Movement. Breath. The invisible force you feel but never see.",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/air.webp`,
    imageStyle: { objectPosition: "center center" },
    shape: SHAPE_AIR,
    align: "right" as const,
  },
  {
    name: "Water",
    tagline: "Force. Flow. The current that never stops.",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/water.webp`,
    imageStyle: { objectPosition: "center center" },
    shape: SHAPE_WATER,
    align: "center" as const,
  },
];

export default function FiveElements(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Intro header — scrub-linked
      if (introRef.current) {
        const introChildren = Array.from(introRef.current.children);
        introChildren.forEach((child, ci) => {
          gsap.fromTo(
            child,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: introRef.current,
                start: `top ${85 - ci * 5}%`,
                end: `top ${55 - ci * 5}%`,
                scrub: 0.5,
              },
            }
          );
        });
      }

      // Text slides in from the side
      panelsRef.current.forEach((panel, i) => {
        if (!panel) return;
        const textEl = panel.querySelector("[data-element-text]");
        const isCenter = elements[i].align === "center";
        const isRight = elements[i].align === "right";

        if (textEl) {
          gsap.fromTo(
            textEl,
            { x: isCenter ? 0 : isRight ? -60 : 60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 80%",
                end: "top 40%",
                scrub: 0.5,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-aubergine py-24 md:py-32">
      {/* Intro */}
      <div ref={introRef} className="mx-auto max-w-3xl px-6 pb-20 text-center md:px-12 md:pb-28">
        <p className="mb-6 font-serif text-sm italic text-cream/50">
          — The Five Elements
        </p>
        <h2 className="mb-6 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] text-cream">
          Do you know you&apos;re made
          <br />
          of five elements?
        </h2>
        <p className="mx-auto max-w-xl font-serif text-[15px] font-light leading-[1.6] text-cream/60">
          Not metaphorically. Literally. Fire. Earth. Space. Water. Air.
          Each element shapes how you think, feel, eat, love, and break
          down. When they&apos;re off, you feel off. Anxious. Stuck. Numb.
          Scattered. When they&apos;re in rhythm, you feel you again.
        </p>
      </div>

      {/* Element panels */}
      <div className="relative z-10 space-y-20 md:space-y-32">
        {elements.map((el, i) => (
          <div
            key={el.name}
            ref={(node) => {
              panelsRef.current[i] = node;
            }}
            className={`flex flex-col gap-8 px-6 md:gap-12 md:px-12 ${
              el.align === "center"
                ? "items-center text-center"
                : el.align === "right"
                  ? "md:flex-row-reverse md:items-center"
                  : "md:flex-row md:items-center"
            } mx-auto max-w-7xl`}
          >
            <BlobImage
              shape={el.shape}
              image={el.image}
              alt={el.name}
              imageStyle={el.imageStyle}
              variant="on-aubergine"
              breathDir={i % 2 === 0 ? "right" : "left"}
              breathDelay={i * 0.3}
              className={
                el.align === "center"
                  ? "h-[40vh] w-full max-w-4xl"
                  : "h-[35vh] w-full md:w-[55%]"
              }
            />

            <div
              data-element-text
              className={
                el.align === "center"
                  ? "max-w-lg"
                  : "max-w-md px-0 md:px-8"
              }
            >
              <p className="mb-4 font-serif text-sm italic text-cream/50">
                — {el.name}
              </p>
              <h3 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] text-cream">
                {el.tagline}
              </h3>
            </div>
          </div>
        ))}

        {/* Element marque */}
        <div className="flex justify-center pt-8">
          <span className="font-serif text-3xl text-cream/20">~</span>
        </div>
      </div>
    </section>
  );
}
