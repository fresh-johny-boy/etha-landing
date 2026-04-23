"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasQuizState, readQuizState, writeQuizState } from "@/lib/quizState";
import { doshaScoring } from "@/lib/doshaScoring";
import QuizEmailGate from "@/components/quiz/QuizEmailGate";

export default function QuizGatePage() {
  const router = useRouter();
  const [dosha, setDosha] = useState<"vata" | "pitta" | "kapha" | null>(null);

  useEffect(() => {
    if (!hasQuizState()) { router.replace("/quiz"); return; }
    try {
      const raw = localStorage.getItem("etha.quiz.result");
      if (raw) {
        const parsed = JSON.parse(raw);
        const primary = parsed?.primary?.toLowerCase();
        if (primary === "vata" || primary === "pitta" || primary === "kapha") {
          setDosha(primary); return;
        }
      }
    } catch {}
    const state = readQuizState();
    if (state?.answers) {
      const result = doshaScoring(state.answers);
      setDosha(result.primary);
    } else {
      setDosha("vata");
    }
  }, [router]);

  if (!dosha) return null;

  return (
    <QuizEmailGate
      dosha={dosha}
      onSuccess={(email) => {
        writeQuizState({ email });
        router.push("/quiz/sent");
      }}
      onCancel={() => router.back()}
    />
  );
}
