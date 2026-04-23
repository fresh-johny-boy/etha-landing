import type { Archetype, QuizData, QuizResult } from "./quizDataContract";
import { DEFAULT_MIRROR_ECHOES } from "./archetypesMock";

function isArchetype(v: string | null): v is Archetype {
  return v === "vata" || v === "pitta" || v === "kapha";
}

export function createMockQuizData(archetypeOverride?: Archetype): QuizData {
  const primary: Archetype = archetypeOverride ?? "vata";
  const secondaryMap: Record<Archetype, Archetype> = {
    vata: "pitta",
    pitta: "kapha",
    kapha: "vata",
  };

  const result: QuizResult = {
    primary,
    secondary: secondaryMap[primary],
    mirrorEchoes: DEFAULT_MIRROR_ECHOES[primary],
  };

  return {
    recordAnswer(stepIdx, answer) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[quizMock] recordAnswer", stepIdx, answer);
      }
    },
    submitEmail(email) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[quizMock] submitEmail", email);
      }
      return new Promise((resolve) => setTimeout(() => resolve(true), 600));
    },
    getResult() {
      return result;
    },
  };
}

export function resolveMockArchetypeFromSearch(search: string | null | undefined): Archetype | undefined {
  if (!search) return undefined;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("mock");
  return isArchetype(raw) ? raw : undefined;
}
