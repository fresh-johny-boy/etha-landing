"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { useQuizData } from "@/components/quiz/QuizDataProvider";
import { ARCHETYPES } from "@/lib/archetypesMock";
import MirrorSection from "@/components/quiz/result/MirrorSection";
import ScienceSection from "@/components/quiz/result/ScienceSection";
import RitualSection from "@/components/quiz/result/RitualSection";
import BotanicalSection from "@/components/quiz/result/BotanicalSection";
import AcademyBridge from "@/components/quiz/result/AcademyBridge";
import AuraDivider from "@/components/quiz/result/AuraDivider";

export default function QuizResultPage() {
  const data = useQuizData();
  const router = useRouter();
  const result = data.getResult();

  const [ready, setReady] = useState(false);
  const holdRef   = useRef<HTMLDivElement>(null);
  const pageRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) {
      const t = setTimeout(() => router.push("/quiz"), 900);
      return () => clearTimeout(t);
    }
    const archetypeName = ARCHETYPES[result.primary].poeticName;
    document.title = `${archetypeName} — Your Rhythm · ĒTHA`;
    /* Deliberate reveal: 800ms hold → fade into content */
    const hold = holdRef.current;
    const page = pageRef.current;
    const ctx = gsap.context(() => {
      if (hold) {
        gsap.fromTo(hold, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.0, ease: "expo.out", delay: 0.2 });
        gsap.to(hold,   { opacity: 0, duration: 0.6, ease: "power2.in", delay: 0.9 });
      }
    });
    const t = setTimeout(() => {
      setReady(true);
      if (page) gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" });
    }, 800);
    return () => { ctx.revert(); clearTimeout(t); };
  }, [result, router]);

  if (!result) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center bg-aubergine px-8 text-center">
        <Nav variant="light" hideLinks progress={1} />
        <p
          className="font-serif text-cream/70 italic"
          style={{ fontSize: "clamp(1rem, 2.4vw, 1.15rem)" }}
        >
          Your map is not here yet. Returning to the beginning.
        </p>
      </main>
    );
  }

  const archetype = ARCHETYPES[result.primary];
  const ritual = archetype.ritual;
  const moments = [ritual.sunrise, ritual.midday, ritual.evening];

  return (
    <main className="relative flex min-h-dvh flex-col bg-aubergine">
      <Nav variant="light" hideLinks progress={1} />

      {!ready && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div ref={holdRef} style={{ opacity: 0 }}>
            <p
              className="font-serif text-cream"
              style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)", lineHeight: 1.1 }}
            >
              Your map is forming.
            </p>
            <p
              className="font-serif text-cream/45 mt-8 italic"
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)" }}
            >
              This will take just a moment.
            </p>
          </div>
        </div>
      )}

      {ready && (
        <div ref={pageRef} className="relative z-10 flex flex-1 flex-col items-center pt-32 pb-32">
          <MirrorSection archetype={archetype} echoes={result.mirrorEchoes} />
          <AuraDivider />
          <ScienceSection paragraphs={archetype.scienceParagraphs} />
          <AuraDivider />
          <RitualSection moments={moments} />
          <AuraDivider />
          <BotanicalSection moments={moments} />
          <AuraDivider />
          <AcademyBridge />
        </div>
      )}
    </main>
  );
}
