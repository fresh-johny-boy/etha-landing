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
import { writeQuizState } from "@/lib/quizState";

const EMAIL_AURA =
  "M 178,4 C 234,2 300,3 338,8 C 354,12 360,22 359,36 C 358,46 346,52 318,54 C 278,56 234,57 178,57 C 122,57 74,56 38,54 C 12,51 4,46 4,36 C 2,22 10,12 28,8 C 66,3 124,2 178,4 Z";

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function validFirstName(n: string): boolean {
  return n.trim().length > 0;
}

export default function QuizEmailGate({
  dosha,
  onSuccess,
}: {
  dosha: Archetype;
  onSuccess: (email: string) => void;
}) {
  const data   = useQuizData();
  const result = data.getResult();

  const theme    = DOSHA_THEMES[dosha];
  const archetype = result ? ARCHETYPES[result.primary] : ARCHETYPES[dosha];

  const [firstName, setFirstName]       = useState("");
  const [email, setEmail]               = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [emailFocus, setEmailFocus]     = useState(false);
  const [nameFocus, setNameFocus]       = useState(false);

  const overlayRef        = useRef<HTMLDivElement>(null);
  const teaserRef         = useRef<HTMLDivElement>(null);
  const formRef           = useRef<HTMLDivElement>(null);
  const bottomRef         = useRef<HTMLDivElement>(null);
  const emailAuraRef      = useRef<SVGPathElement>(null);
  const bgAuraRef         = useRef<SVGSVGElement>(null);

  /* Escape to close + background inert while open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSuccess("");
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
    if (!validFirstName(firstName)) {
      setError("Please enter your first name.");
      return;
    }
    if (!validEmail(email.trim())) {
      setError("A complete email, please.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const ok = await data.submitEmail(email.trim());
    if (!ok) {
      setSubmitting(false);
      setError("Something held this back. Please try again.");
      return;
    }

    writeQuizState({ firstName: firstName.trim(), email: email.trim() });

    /* Success — fade gate out, reveal result beneath */
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.in",
      onComplete: () => onSuccess(email.trim()),
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
          YOUR DOSHA HAS BEEN IDENTIFIED
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

        {/* Form */}
        <div
          ref={formRef}
          className="w-full mt-14"
          style={{ maxWidth: 380, opacity: 0 }}
        >
          <h3
            className="font-serif mb-2 leading-tight"
            style={{
              fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
              color: "rgba(255,239,222,0.92)",
            }}
          >
            Where should we send your report?
          </h3>
          <p
            className="font-serif italic mb-7 leading-relaxed"
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              color: "rgba(255,239,222,0.65)",
            }}
          >
            Your complete rhythm map, your daily ritual, and your botanical recommendations, written for you alone. Enter your name and email to read it in full.
          </p>

          {/* First name input */}
          <div className="relative mb-4">
            <svg
              className="pointer-events-none absolute overflow-visible"
              viewBox="0 0 360 58"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
              style={{ left: "-10px", top: "-8px", width: "calc(100% + 20px)", height: "calc(100% + 16px)" }}
            >
              <path d={EMAIL_AURA} fill={theme.dimAccent} stroke="none" />
              <path
                d={EMAIL_AURA}
                fill="none"
                stroke={theme.nameColor}
                strokeWidth="0.9"
                strokeOpacity={nameFocus ? 0.7 : 0.28}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              id="quiz-firstname"
              type="text"
              autoComplete="given-name"
              maxLength={80}
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); if (error) setError(null); }}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              placeholder="Your first name"
              className="w-full bg-transparent font-serif text-center py-5 px-6 outline-none"
              style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)", color: "rgba(255,239,222,0.90)" }}
            />
          </div>

          {/* Email input */}
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
              <path
                d={EMAIL_AURA}
                fill={theme.dimAccent}
                stroke="none"
              />
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
              maxLength={254}
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

      {/* CTA + legal */}
      <div
        ref={bottomRef}
        className="relative z-10 flex flex-col items-center px-8 pt-3 pb-10 sm:pb-14"
        style={{ opacity: 0 }}
      >
        <div className="w-full text-center">
          <QuizCTAButton
            label={submitting ? "SENDING" : "SEND MY FULL REPORT"}
            onClick={onSubmit}
            disabled={submitting || !validFirstName(firstName) || !validEmail(email.trim())}
            strokeColor={theme.nameColor}
          />
        </div>

        {/* Legal consent */}
        <p
          className="font-serif mt-4 leading-relaxed"
          style={{ fontSize: "0.75rem", color: "rgba(255,239,222,0.40)", maxWidth: 320, textAlign: "center" }}
        >
          By continuing you agree to our{" "}
          <a href="/legal/terms" style={{ textDecoration: "underline" }}>Terms and Conditions</a>
          {" "}and{" "}
          <a href="/legal/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
        </p>

        {/* Privacy note */}
        <p
          className="font-serif mt-2"
          style={{ fontSize: "0.75rem", color: "rgba(255,239,222,0.40)", textAlign: "center" }}
        >
          Private. Never shared. Unsubscribe at any moment.
        </p>
      </div>
    </div>
  );
}
