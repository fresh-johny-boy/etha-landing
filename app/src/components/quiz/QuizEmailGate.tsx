"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { QuizCTAButton } from "./QuizCTAButton";
import { useQuizData } from "./QuizDataProvider";
import { ARCHETYPES } from "@/lib/archetypesMock";

const AIR = "expo.out";

const EMAIL_AURA = "M 178,4 C 234,2 300,3 338,8 C 354,12 360,22 359,36 C 358,46 346,52 318,54 C 278,56 234,57 178,57 C 122,57 74,56 38,54 C 12,51 4,46 4,36 C 2,22 10,12 28,8 C 66,3 124,2 178,4 Z";

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function QuizEmailGate() {
  const data = useQuizData();
  const router = useRouter();
  const result = data.getResult();

  const [email, setEmail]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [emailFocus, setEmailFocus] = useState(false);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const teaserRef    = useRef<HTMLDivElement>(null);
  const formRef      = useRef<HTMLDivElement>(null);
  const emailAuraRef = useRef<SVGPathElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);

  const archetype = result ? ARCHETYPES[result.primary] : ARCHETYPES.vata;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(teaserRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.1, ease: AIR, delay: 0.3 },
      );
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.9, ease: AIR, delay: 0.95 },
      );
      gsap.fromTo(bottomRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.9, ease: AIR, delay: 1.1 },
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!emailAuraRef.current) return;
    gsap.to(emailAuraRef.current, { strokeOpacity: emailFocus ? 0.65 : 0.28, duration: 0.45, ease: "power2.out" });
  }, [emailFocus]);

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
    if (formRef.current) {
      gsap.to(formRef.current, { opacity: 0, y: -10, duration: 0.5, ease: "power2.in" });
    }
    if (bottomRef.current) {
      gsap.to(bottomRef.current, { opacity: 0, y: -10, duration: 0.5, ease: "power2.in" });
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

          <div className="relative">
            <svg
              className="pointer-events-none absolute overflow-visible"
              viewBox="0 0 360 58"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
              style={{ left: "-10px", top: "-8px", width: "calc(100% + 20px)", height: "calc(100% + 16px)" }}
            >
              <path d={EMAIL_AURA} fill="rgba(255,239,222,0.18)" stroke="none" />
              <path
                ref={emailAuraRef}
                d={EMAIL_AURA}
                fill="none"
                stroke="#FFEFDE"
                strokeWidth="1"
                strokeOpacity="0.28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              id="quiz-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              placeholder="your@email.here"
              className={[
                "w-full bg-transparent text-cream font-serif text-center py-5 px-6 outline-none",
                "placeholder:text-cream/40 placeholder:italic",
              ].join(" ")}
              style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
            />
          </div>

          {error && (
            <p className="font-serif text-cream/60 italic mt-3" style={{ fontSize: "0.95rem" }}>
              {error}
            </p>
          )}

        </div>
      </div>

      <div
        ref={bottomRef}
        className="relative z-10 flex flex-col items-center px-8 pt-3 pb-10 sm:pb-14"
      >
        <div className="w-full max-w-md text-center">
          <QuizCTAButton
            label={submitting ? "SENDING" : "BEGIN YOUR REMEMBERING"}
            onClick={onSubmit}
            disabled={submitting || !validEmail(email)}
          />
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
