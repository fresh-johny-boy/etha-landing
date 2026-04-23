"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizSent from "@/components/quiz/QuizSent";
import { hasQuizState } from "@/lib/quizState";

export default function SentPage() {
  const router = useRouter();
  useEffect(() => {
    if (!hasQuizState()) router.replace("/quiz");
  }, [router]);

  return <QuizSent onAdvance={() => router.push("/quiz/result")} />;
}
