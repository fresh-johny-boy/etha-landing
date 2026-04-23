"use client";
import { Suspense, useEffect } from "react";
import { QuizDataProvider } from "@/components/quiz/QuizDataProvider";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#3D233B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  return (
    <Suspense fallback={null}>
      <QuizDataProvider>{children}</QuizDataProvider>
    </Suspense>
  );
}
