"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QuizDataProvider } from "@/components/quiz/QuizDataProvider";
import { hasQuizState, clearQuizState } from "@/lib/quizState";
import AuraButton from "@/components/AuraButton";

function ResumeModal({ onContinue, onStartOver }: { onContinue: () => void; onStartOver: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(61,35,59,0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
        <h2
          className="font-serif text-cream"
          style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.9rem)", marginBottom: "40px", lineHeight: 1.3 }}
        >
          Continue where you left off.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <AuraButton onClick={onContinue} className="w-full justify-center text-cream">
            CONTINUE
          </AuraButton>
          <button
            onClick={onStartOver}
            className="font-label"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,239,222,0.35)", fontSize: "0.6rem", letterSpacing: "0.2em" }}
          >
            START OVER
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showResume, setShowResume] = useState(false);

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
    setShowResume(false);
  };

  return (
    <>
      {showResume && (
        <ResumeModal onContinue={handleContinue} onStartOver={handleStartOver} />
      )}
      {children}
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
