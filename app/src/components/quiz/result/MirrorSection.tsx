"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { ArchetypeContent } from "@/lib/archetypesMock";

export default function MirrorSection({
  archetype,
  echoes,
}: {
  archetype: ArchetypeContent;
  echoes: string[];
}) {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subRef  = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(labelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.1 });
      gsap.fromTo(nameRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.35 });
      gsap.fromTo(subRef.current,  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.0, ease: "expo.out", delay: 0.75 });
      if (listRef.current) {
        gsap.fromTo(Array.from(listRef.current.children),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.25, delay: 1.2 },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full max-w-xl mx-auto px-7 sm:px-10 text-center">
      <p
        ref={labelRef}
        className="font-label text-[10px] text-cream/55 mb-7"
        style={{ letterSpacing: "0.3em", opacity: 0 }}
      >
        YOUR MIRROR
      </p>

      <h1
        ref={nameRef}
        className="font-serif text-cream leading-[1.02]"
        style={{ fontSize: "clamp(2.8rem, 10vw, 5.6rem)", opacity: 0 }}
      >
        {archetype.poeticName}
      </h1>

      <p
        ref={subRef}
        className="font-serif italic text-cream/75 mt-5 leading-relaxed"
        style={{ fontSize: "clamp(1.05rem, 2.6vw, 1.3rem)", opacity: 0 }}
      >
        {archetype.heroLine}
      </p>

      <ul ref={listRef} className="mt-14 space-y-6 text-left">
        {echoes.map((line, i) => (
          <li
            key={i}
            className="font-serif text-cream/85 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", opacity: 0 }}
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
