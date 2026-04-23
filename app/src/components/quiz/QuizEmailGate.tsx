"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { QuizCTAButton } from "./QuizCTAButton";
import { useQuizData } from "./QuizDataProvider";
import { ARCHETYPES } from "@/lib/archetypesMock";
import {
  DOSHA_THEMES,
  AURA_PATHS,
  AURA_VIEWBOXES,
  GATE_AURA_POS,
} from "@/lib/doshaThemes";
import type { Archetype } from "@/lib/quizDataContract";

const EMAIL_AURA =
  "M 178,4 C 234,2 300,3 338,8 C 354,12 360,22 359,36 C 358,46 346,52 318,54 C 278,56 234,57 178,57 C 122,57 74,56 38,54 C 12,51 4,46 4,36 C 2,22 10,12 28,8 C 66,3 124,2 178,4 Z";

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function QuizEmailGate({
  dosha,
  onSuccess,
}: {
  dosha: Archetype;
  onSuccess: () => void;
}) {
  const data   = useQuizData();
  const result = data.getResult();

  const theme    = DOSHA_THEMES[dosha];
  const archetype = result ? ARCHETYPES[result.primary] : ARCHETYPES[dosha];

  const [email, setEmail]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [emailFocus, setEmailFocus] = useState(false);

  const overlayRef    = useRef<HTMLDivElement>(null);
  const teaserRef     = useRef<HTMLDivElement>(null);
  const formRef       = useRef<HTMLDivElement>(null);
  const bottomRef     = useRef<HTMLDivElement>(null);
  const emailAuraRef  = useRef<SVGPathElement>(null);
  const bgAuraRef     = useRef<SVGSVGElement>(null);

  /* Escape to close + background inert while open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSuccess();
    };
    window.addEventListener("keydown", onKey);
    const main = document.querySelector("main");
    main?.setAttribute("aria-hidden", "true");
    return () => {
      window.removeEventListener("keydown", onKey);
      main?.removeAttribute("aria-hidden");
    };
  }, [onSuccess]);

  /* Simple focus-trap: loop Tab / Shift+Tab within the dialog */
  useEffect(() => {
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !overlayRef.current) return;
      const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => window.removeEventListener("keydown", trap);
  }, []);

  /* Entry animation */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [overlayRef.current, teaserRef.current, formRef.current, bottomRef.current],
          { opacity: 1, y: 0 }
        );
        setTimeout(() => document.getElementById("quiz-email")?.focus(), 50);
        return;
      }

      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
      );
      gsap.fromTo(teaserRef.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: 0.3 },
      );
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", delay: 0.85 },
      );
      gsap.fromTo(bottomRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", delay: 1.05 },
      );

      /* Background aura: slow breathe */
      gsap.to(bgAuraRef.current, {
        scale: 1.03, duration: 10, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center", delay: 0.5,
      });
      gsap.to(bgAuraRef.current, {
        y: -12, duration: 13, ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: 0.5,
      });

      /* Focus email input after form animates in */
      setTimeout(() => document.getElementById("quiz-email")?.focus(), 900);
    });
    return () => ctx.revert();
  }, []);

  /* Email input aura focus glow */
  useEffect(() => {
    if (!emailAuraRef.current) return;
    gsap.to(emailAuraRef.current, {
      strokeOpacity: emailFocus ? 0.7 : 0.28,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [emailFocus]);

  const onSubmit = async () => {
    if (submitting) return;
    if (!validEmail(email)) {
      setError("A complete email, please.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const ok = await data.submitEmail(email);
    if (!ok) {
      setSubmitting(false);
      setError("Something held this back. Please try again.");
      return;
    }

    /* Success — fade gate out, reveal result beneath */
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.in",
      onComplete: onSuccess,
    });
  };

  const auraPos = GATE_AURA_POS[dosha];

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-heading"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: theme.bg, opacity: 0 }}
    >
      {/* Atmospheric background aura */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg
          ref={bgAuraRef}
          viewBox={AURA_VIEWBOXES[dosha]}
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", overflow: "visible", willChange: "transform", ...auraPos }}
        >
          <path
            d={AURA_PATHS[dosha]}
            stroke={theme.nameColor}
            strokeOpacity="0.10"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">

        <p
          id="gate-heading"
          className="font-label text-[10px] mb-7"
          style={{ letterSpacing: "0.3em", color: "rgba(255,239,222,0.62)" }}
        >
          YOUR MAP IS READY
        </p>

        {/* Blurred teaser — same archetype as result page */}
        <div
          ref={teaserRef}
          style={{ filter: "blur(7px)", opacity: 0, maxWidth: 440 }}
          className="mx-auto"
          aria-hidden="true"
        >
          <h2
            className="font-serif leading-[1.02]"
            style={{
              fontSize: "clamp(2.6rem, 9vw, 5rem)",
              color: theme.nameColor,
            }}
          >
            {archetype.poeticName}
          </h2>
          <p
            className="font-serif italic mt-4 leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              color: "rgba(255,239,222,0.65)",
            }}
          >
            {archetype.heroLine}
          </p>
        </div>

        {/* Email form */}
        <div
          ref={formRef}
          className="w-full mt-14"
          style={{ maxWidth: 380, opacity: 0 }}
        >
          <label
            htmlFor="quiz-email"
            className="font-serif block mb-5 leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 2.3vw, 1.12rem)",
              color: "rgba(255,239,222,0.78)",
            }}
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
              style={{
                left: "-10px",
                top: "-8px",
                width: "calc(100% + 20px)",
                height: "calc(100% + 16px)",
              }}
            >
              {/* Subtle fill tint */}
              <path
                d={EMAIL_AURA}
                fill={theme.dimAccent}
                stroke="none"
              />
              {/* Dosha-coloured aura stroke */}
              <path
                ref={emailAuraRef}
                d={EMAIL_AURA}
                fill="none"
                stroke={theme.nameColor}
                strokeWidth="0.9"
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
              className="w-full bg-transparent font-serif text-center py-5 px-6 outline-none"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                color: "rgba(255,239,222,0.90)",
              }}
            />
          </div>

          <p
            role="alert"
            aria-live="assertive"
            className="font-serif italic mt-3"
            style={{ fontSize: "0.92rem", color: "rgba(255,239,222,0.55)", minHeight: "1.4em" }}
          >
            {error ?? ""}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div
        ref={bottomRef}
        className="relative z-10 flex flex-col items-center px-8 pt-3 pb-10 sm:pb-14"
        style={{ opacity: 0 }}
      >
        <div className="w-full text-center" style={{ maxWidth: 380 }}>
          <QuizCTAButton
            label={submitting ? "SENDING" : "BEGIN YOUR REMEMBERING"}
            onClick={onSubmit}
            disabled={submitting || !validEmail(email)}
            strokeColor={theme.nameColor}
          />
          <p
            className="font-serif italic mt-5 mx-auto"
            style={{
              fontSize: "clamp(0.82rem, 1.9vw, 0.92rem)",
              color: "rgba(255,239,222,0.62)",
              maxWidth: 300,
              lineHeight: 1.55,
            }}
          >
            Your answers are private. We send your map, and then we wait for you to ask for more.
          </p>
        </div>
      </div>
    </div>
  );
}
