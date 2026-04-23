"use client";
import { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { QuizData } from "@/lib/quizDataContract";
import { createMockQuizData, resolveMockArchetypeFromSearch } from "@/lib/quizDataMock";

const QuizDataContext = createContext<QuizData | null>(null);

export function QuizDataProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const archetype = resolveMockArchetypeFromSearch(searchParams?.toString() ?? null);

  const value = useMemo(() => createMockQuizData(archetype), [archetype]);

  return <QuizDataContext.Provider value={value}>{children}</QuizDataContext.Provider>;
}

export function useQuizData(): QuizData {
  const ctx = useContext(QuizDataContext);
  if (!ctx) {
    throw new Error("useQuizData must be used inside QuizDataProvider");
  }
  return ctx;
}
