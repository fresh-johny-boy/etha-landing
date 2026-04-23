"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QuizDataProvider } from "@/components/quiz/QuizDataProvider";
import { hasQuizState, clearQuizState } from "@/lib/quizState";
import AuraButton from "@/components/AuraButton";
import Nav from "@/components/Nav";

function ResumeModal({ onContinue, onStartOver }: { onContinue: () => void; onStartOver: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(61,35,59,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <Nav variant="light" hideLinks className="relative z-10" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          pointerEvents: "none",
        }}
      >
        <h2
          className="font-serif text-cream"
          style={{ fontSize: "clamp(1.9rem, 5vw, 2.8rem)", lineHeight: 1.2, textAlign: "center", maxWidth: "480px" }}
        >
          Continue where you left off.
        </h2>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "0 24px 48px",
        }}
      >
        <AuraButton onClick={onContinue} className="w-full max-w-sm justify-center text-cream">
          CONTINUE
        </AuraButton>
        <button
          onClick={onStartOver}
          className="font-label"
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,239,222,0.6)", fontSize: "0.65rem", letterSpacing: "0.2em" }}
        >
          START OVER
        </button>
      </div>
    </div>
  );
}

function QuizLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showResume, setShowResume] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#3D233B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  useEffect(() => {
    if (pathname === "/quiz" && typeof window !== "undefined" && hasQuizState()) {
      setShowResume(true);
    }
  }, [pathname]);

  const handleContinue = () => setShowResume(false);

  const handleStartOver = () => {
    clearQuizState();
    setRestartKey(k => k + 1);
    setShowResume(false);
  };

  return (
    <>
      {showResume && (
        <ResumeModal onContinue={handleContinue} onStartOver={handleStartOver} />
      )}
      <div key={restartKey} style={{ display: "contents" }}>
        {children}
      </div>
    </>
  );
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <QuizDataProvider>
        <QuizLayoutInner>{children}</QuizLayoutInner>
      </QuizDataProvider>
    </Suspense>
  );
}
