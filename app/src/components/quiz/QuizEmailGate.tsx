"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { QuizCTAButton } from "./QuizCTAButton";
import { useQuizData } from "./QuizDataProvider";
import { ARCHETYPES } from "@/lib/archetypesMock";

const AIR = "expo.out";

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function QuizEmailGate() {
  const data = useQuizData();
  const router = useRouter();
  const result = data.getResult();

  const [email, setEmail]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const teaserRef = useRef<HTMLDivElement>(null);
  const formRef   = useRef<HTMLDivElement>(null);

  const archetype = result ? ARCHETYPES[result.primary] : ARCHETYPES.vata;

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(teaserRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.1, ease: AIR, delay: 0.3 },
      );
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.9, ease: AIR, delay: 0.95 },
      );
    });
    return () => ctx.revert();
  }, []);

  const onSubmit = async () => {
    if (submitting) return;
    if (!validEmail(email)) {
      setError("A complete email, please.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const teaser = teaserRef.current;
    const ok = await data.submitEmail(email);
    if (!ok) {
      setSubmitting(false);
      setError("Something held this back. Please try again.");
      return;
    }

    /* Fade blur off the teaser while we move to the result */
    if (teaser) {
      gsap.to(teaser, {
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power2.out",
      });
    }
    const form = formRef.current;
    if (form) {
      gsap.to(form, { opacity: 0, y: -10, duration: 0.5, ease: "power2.in" });
    }
    setTimeout(() => { router.push("/quiz/result"); }, 900);
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-aubergine overflow-hidden select-none">
      <Nav variant="light" hideLinks progress={1} />

      <div
        ref={wrapRef}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-16 text-center"
      >
        <p className="font-label text-[10px] text-cream/55 mb-6" style={{ letterSpacing: "0.3em" }}>
          YOUR MAP IS READY
        </p>

        <div
          ref={teaserRef}
          style={{ filter: "blur(8px)", opacity: 0 }}
          className="max-w-xl mx-auto"
        >
          <h1
            className="font-serif text-cream leading-[1.04]"
            style={{ fontSize: "clamp(2.8rem, 8.5vw, 5.6rem)" }}
          >
            {archetype.poeticName}
          </h1>
          <p
            className="font-serif italic text-cream/75 mt-5 leading-relaxed"
            style={{ fontSize: "clamp(1.05rem, 2.6vw, 1.35rem)" }}
          >
            {archetype.heroLine}
          </p>
        </div>

        <div
          ref={formRef}
          className="w-full max-w-md mt-14"
          style={{ opacity: 0 }}
        >
          <label
            htmlFor="quiz-email"
            className="font-serif text-cream/80 block mb-5 leading-relaxed"
            style={{ fontSize: "clamp(1rem, 2.3vw, 1.15rem)" }}
          >
            Leave the name of your inbox, and your map will find you there.
          </label>

          <input
            id="quiz-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
            placeholder="your@email.here"
            className={[
              "w-full bg-cream text-aubergine font-serif text-center py-5 px-6 outline-none",
              "placeholder:text-aubergine/35",
            ].join(" ")}
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
          />

          {error && (
            <p className="font-serif text-cream/60 italic mt-3" style={{ fontSize: "0.95rem" }}>
              {error}
            </p>
          )}

          <div className="mt-7">
            <QuizCTAButton
              label={submitting ? "SENDING" : "BEGIN YOUR REMEMBERING"}
              onClick={onSubmit}
              disabled={submitting || !validEmail(email)}
            />
          </div>

          <p
            className="font-serif text-cream/55 italic leading-relaxed mt-6 mx-auto max-w-sm"
            style={{ fontSize: "clamp(0.85rem, 2vw, 0.95rem)" }}
          >
            Your answers are private. We send your map, and then we wait for you to ask for more.
          </p>
        </div>
      </div>
    </main>
  );
}
