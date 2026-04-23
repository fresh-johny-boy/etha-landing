"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizCompletion from "@/components/quiz/QuizCompletion";
import { hasQuizState, writeQuizState, pushHistory } from "@/lib/quizState";

export default function CompletionPage() {
  const router = useRouter();
  useEffect(() => {
    if (!hasQuizState()) router.replace("/quiz");
  }, [router]);

  function handleAdvance() {
    pushHistory("completion");
    writeQuizState({ completedAt: Date.now() });
    router.push("/quiz/result");
  }

  return <QuizCompletion onAdvance={handleAdvance} />;
}
