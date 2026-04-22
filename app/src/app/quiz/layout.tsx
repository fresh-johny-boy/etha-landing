"use client";
import { useEffect } from "react";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#3D233B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  return <>{children}</>;
}
