"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizGatePage() {
  const router = useRouter();
  useEffect(() => { router.replace("/quiz/result"); }, [router]);
  return null;
}
