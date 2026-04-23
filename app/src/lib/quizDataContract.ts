export type Archetype = "vata" | "pitta" | "kapha";

export type QuizResult = {
  primary: Archetype;
  secondary: Archetype;
  mirrorEchoes: string[];
};

export type QuizData = {
  recordAnswer(stepIdx: number, answer: string | number): void;
  submitEmail(email: string): Promise<boolean>;
  getResult(): QuizResult | null;
};
