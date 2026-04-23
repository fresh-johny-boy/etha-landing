const STORAGE_KEY = "etha.quiz.state.v1";

export interface QuizState {
  v: 1;
  introScreen: number;
  layer: 1 | 2 | 3;
  stepIndex: number;
  answers: Record<string, string>;
  history: string[];
  firstName?: string;
  email?: string;
  completedAt?: number;
}

const DEFAULT_STATE: QuizState = {
  v: 1,
  introScreen: 0,
  layer: 1,
  stepIndex: 0,
  answers: {},
  history: [],
};

export function readQuizState(): QuizState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizState;
    if (parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeQuizState(
  patch: Partial<Omit<QuizState, "v">>
): QuizState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  const existing = readQuizState() ?? { ...DEFAULT_STATE };
  const next: QuizState = { ...existing, ...patch, v: 1 };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage quota exceeded or private mode — fail silently
  }
  return next;
}

export function clearQuizState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasQuizState(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as QuizState;
    return parsed.v === 1;
  } catch {
    return false;
  }
}

export function pushHistory(loc: string): void {
  if (typeof window === "undefined") return;
  const state = readQuizState() ?? { ...DEFAULT_STATE };
  state.history.push(loc);
  writeQuizState({ history: state.history });
}

export function popHistory(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const state = readQuizState() ?? { ...DEFAULT_STATE };
  const popped = state.history.pop();
  writeQuizState({ history: state.history });
  return popped;
}
