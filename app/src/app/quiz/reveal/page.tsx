"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizDoshaReveal from "@/components/quiz/QuizDoshaReveal";
import { hasQuizState, readQuizState, pushHistory } from "@/lib/quizState";
import type { Archetype } from "@/lib/quizDataContract";

export default function RevealPage() {
  const router = useRouter();
  const [dosha, setDosha] = useState<Archetype | null>(null);

  useEffect(() => {
    if (!hasQuizState()) {
      router.replace("/quiz");
      return;
    }

    // Try stored result key first
    try {
      const raw = localStorage.getItem("etha.quiz.result");
      if (raw) {
        const parsed = JSON.parse(raw);
        const primary = parsed?.primary?.toLowerCase();
        if (primary === "vata" || primary === "pitta" || primary === "kapha") {
          setDosha(primary as Archetype);
          return;
        }
      }
    } catch {
      // fall through to answer-count fallback
    }

    // Fallback: count a/b/c answers from quiz state
    const state = readQuizState();
    if (state?.answers) {
      const counts = { a: 0, b: 0, c: 0 };
      Object.values(state.answers).forEach((v) => {
        if (v in counts) counts[v as keyof typeof counts]++;
      });
      const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
      setDosha(top === "a" ? "vata" : top === "b" ? "pitta" : "kapha");
    } else {
      setDosha("vata");
    }
  }, [router]);

  function handleAdvance() {
    pushHistory("reveal");
    router.push("/quiz/result");
  }

  if (!dosha) return null;
  return <QuizDoshaReveal dosha={dosha} onAdvance={handleAdvance} />;
}
