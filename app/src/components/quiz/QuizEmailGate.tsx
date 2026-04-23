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

const SENT_COPY: Record<Archetype, { headline: string; lines: [string, string, string] }> = {
  vata: {
    headline: "Your map is travelling.",
    lines: [
      "Check your inbox. Something made for you alone is arriving.",
      "Take a breath. You just did something most people never do.",
      "You listened.",
    ],
  },
  pitta: {
    headline: "Your map is on its way.",
    lines: [
      "Check your inbox. Something made for you alone is arriving.",
      "Take a breath. You just did something most people never do.",
      "You listened.",
    ],
  },
  kapha: {
    headline: "Your map is on its way.",
    lines: [
      "Check your inbox. Something made for you alone is arriving.",
      "Take a breath. You just did something most people never do.",
      "You listened.",
    ],
  },
};

function validEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function validFirstName(n: string): boolean {
  return n.trim().length > 0;
}

export default function QuizEmailGate({
  dosha,
  onSuccess,
  onCancel,
}: {
  dosha: Archetype;
  onSuccess: (email: string) => void;
  onCancel?: () => void;
}) {
  const data   = useQuizData();
  const result = data.getResult();

  const theme    = DOSHA_THEMES[dosha];
  const archetype = result ? ARCHETYPES[result.primary] : ARCHETYPES[dosha];

  const [firstName, setFirstName]   = useState("");
  const [email, setEmail]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [emailFocus, setEmailFocus] = useState(false);
  const [nameFocus, setNameFocus]   = useState(false);
  const [sent, setSent]             = useState(false);

  const overlayRef    = useRef<HTMLDivElement>(null);
  const teaserRef     = useRef<HTMLDivElement>(null);
  const formRef       = useRef<HTMLDivElement>(null);
  const bottomRef     = useRef<HTMLDivElement>(null);
  const emailAuraRef  = useRef<SVGPathElement>(null);
  const bgAuraRef     = useRef<SVGSVGElement>(null);

  const sentPanelRef  = useRef<HTMLDivElement>(null);
  const sentHeadRef   = useRef<HTMLHeadingElement>(null);
  const sentLine1Ref  = useRef<HTMLParagraphElement>(null);
  const sentLine2Ref  = useRef<HTMLParagraphElement>(null);
  const sentLine3Ref  = useRef<HTMLParagraphElement>(null);

  const isSentRef     = useRef(false);
  const advancedRef   = useRef(false);
  const advanceTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailValRef   = useRef("");

  function advance() {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.in",
      onComplete: () => onSuccess(emailValRef.current),
    });
  }

  /* Cleanup advance timer */
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  /* Escape to close + background inert while open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSentRef.current) { advance(); return; }
        onCancel?.();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    const main = document.querySelector("main");
    main?.setAttribute("aria-hidden", "true");
    return () => {
      window.removeEventListener("keydown", onKey);
      main?.removeAttribute("aria-hidden");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCancel]);

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
      strokeOpacity: emailFocus ? 0.65 : 0.22,
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
    emailValRef.current = email.trim();

    /* Transition to sent state within the same overlay */
    isSentRef.current = true;
    setSent(true);

    gsap.to([teaserRef.current, formRef.current, bottomRef.current], {
      opacity: 0, y: -16, duration: 0.5, ease: "power2.in", stagger: 0.06,
    });

    gsap.set(
      [sentHeadRef.current, sentLine1Ref.current, sentLine2Ref.current, sentLine3Ref.current],
      { opacity: 0, y: 20 }
    );
    gsap.to(sentHeadRef.current,  { opacity: 1, y: 0, duration: 1.1, ease: "power2.out", delay: 0.7 });
    gsap.to(sentLine1Ref.current, { opacity: 1, y: 0, duration: 1,   ease: "power2.out", delay: 1.3 });
    gsap.to(sentLine2Ref.current, { opacity: 1, y: 0, duration: 1,   ease: "power2.out", delay: 1.9 });
    gsap.to(sentLine3Ref.current, { opacity: 1, y: 0, duration: 1,   ease: "power2.out", delay: 2.5 });

    advanceTimer.current = setTimeout(advance, 7500);
  };

  const auraPos = GATE_AURA_POS[dosha];
  const sentCopy = SENT_COPY[dosha];

  const bgRgba: Record<Archetype, string> = {
    vata:  "rgba(16,31,106,0.92)",
    pitta: "rgba(125,0,40,0.92)",
    kapha: "rgba(0,74,69,0.92)",
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-heading"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: bgRgba[dosha], backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", opacity: 0 }}
      onClick={sent ? advance : undefined}
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

      {/* Sent confirmation panel — fades in after submit */}
      <div
        ref={sentPanelRef}
        className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center z-20"
        style={{ pointerEvents: sent ? "auto" : "none", cursor: sent ? "pointer" : "default" }}
        aria-live="polite"
      >
        <h2
          ref={sentHeadRef}
          id="gate-heading"
          className="font-serif"
          style={{
            fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
            lineHeight: 1.2,
            color: theme.nameColor,
            marginBottom: "2rem",
            opacity: 0,
          }}
        >
          {sentCopy.headline}
        </h2>
        <p
          ref={sentLine1Ref}
          className="font-serif italic"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: 1.6,
            color: "rgba(255,239,222,0.75)",
            marginBottom: "1.5rem",
            maxWidth: 400,
            opacity: 0,
          }}
        >
          {sentCopy.lines[0]}
        </p>
        <p
          ref={sentLine2Ref}
          className="font-serif italic"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: 1.6,
            color: "rgba(255,239,222,0.75)",
            marginBottom: "1.5rem",
            maxWidth: 400,
            opacity: 0,
          }}
        >
          {sentCopy.lines[1]}
        </p>
        <p
          ref={sentLine3Ref}
          className="font-serif italic"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            lineHeight: 1.6,
            color: "rgba(255,239,222,0.75)",
            maxWidth: 400,
            opacity: 0,
          }}
        >
          {sentCopy.lines[2]}
        </p>
      </div>

      {/* Form content — fades out after submit */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">

        {/* Blurred teaser */}
        <div
          ref={teaserRef}
          style={{ filter: "blur(7px)", opacity: 0, maxWidth: 440 }}
          className="mx-auto"
          aria-hidden="true"
        >
          <h2
            id="gate-heading"
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
              color: "rgba(255,239,222,0.90)",
            }}
          >
            {archetype.heroLine}
          </p>
        </div>

        {/* Form */}
        <div
          ref={formRef}
          className="w-full mt-20"
          style={{ maxWidth: 380, opacity: 0 }}
        >
          <h3
            className="font-serif mb-2 leading-tight"
            style={{
              fontSize: "clamp(1.65rem, 4vw, 2.1rem)",
              color: "#FFEFDE",
            }}
          >
            Where should we send your report?
          </h3>
          <p
            className="font-serif italic mb-12 leading-relaxed"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255,239,222,0.90)",
            }}
          >
            Your complete rhythm map, your daily ritual, and your botanical recommendations, written for you alone. Enter your name and email to read it in full.
          </p>

          {/* First name input */}
          <div className="relative mb-6">
            <svg
              className="pointer-events-none absolute overflow-visible"
              viewBox="0 0 360 58"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
              style={{ left: "-10px", top: "-8px", width: "calc(100% + 20px)", height: "calc(100% + 16px)" }}
            >
              <path d={EMAIL_AURA} fill="rgba(255,239,222,0.07)" stroke="none" />
              <path
                d={EMAIL_AURA}
                fill="none"
                stroke="#FFEFDE"
                strokeWidth="0.9"
                strokeOpacity={nameFocus ? 0.65 : 0.22}
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
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                color: "rgba(255,239,222,0.90)",
                colorScheme: "dark",
                borderRadius: 0,
                border: "none",
                appearance: "none",
                WebkitAppearance: "none",
                WebkitBoxShadow: `0 0 0 100px ${bgRgba[dosha]} inset`,
                WebkitTextFillColor: "rgba(255,239,222,0.90)",
              }}
              onClick={(e) => e.stopPropagation()}
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
                fill="rgba(255,239,222,0.07)"
                stroke="none"
              />
              <path
                ref={emailAuraRef}
                d={EMAIL_AURA}
                fill="none"
                stroke="#FFEFDE"
                strokeWidth="0.9"
                strokeOpacity="0.22"
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
                colorScheme: "dark",
                borderRadius: 0,
                border: "none",
                appearance: "none",
                WebkitAppearance: "none",
                WebkitBoxShadow: `0 0 0 100px ${bgRgba[dosha]} inset`,
                WebkitTextFillColor: "rgba(255,239,222,0.90)",
              }}
              onClick={(e) => e.stopPropagation()}
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
        onClick={(e) => e.stopPropagation()}
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
          style={{ fontSize: "0.75rem", color: "rgba(255,239,222,0.70)", maxWidth: 320, textAlign: "center" }}
        >
          By continuing you agree to our{" "}
          <a href="/legal/terms" style={{ textDecoration: "underline" }}>Terms and Conditions</a>
          {" "}and{" "}
          <a href="/legal/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a>.
        </p>

        {/* Privacy note */}
        <p
          className="font-serif mt-2"
          style={{ fontSize: "0.75rem", color: "rgba(255,239,222,0.70)", textAlign: "center" }}
        >
          Private. Never shared. Unsubscribe at any moment.
        </p>
      </div>
    </div>
  );
}
