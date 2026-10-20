export type ReviewArea = 'vocabulary' | 'grammar' | 'reading' | 'listening';

export type WrongQuestion = {
  id: string;
  area: ReviewArea;
  source: string;
  kind: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
  passage?: string;
  transcript?: string;
  savedAt: number;
};

export type QuestionAttempt = {
  question: WrongQuestion;
  selected: string;
};

export function reviewQuestion(
  id: string,
  area: ReviewArea,
  source: string,
  question: { kind?: string; prompt: string; choices: readonly string[]; answer: string; explanation?: string },
  context?: { passage?: string; transcript?: string },
): WrongQuestion {
  return {
    id, area, source, kind: question.kind ?? '연습 문제',
    prompt: question.prompt, choices: [...question.choices], answer: question.answer,
    explanation: question.explanation ?? '', ...context, savedAt: Date.now(),
  };
}

export function parseWrongQuestions(value: string | null): WrongQuestion[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WrongQuestion =>
      !!item && typeof item === 'object' &&
      typeof item.id === 'string' && typeof item.source === 'string' &&
      ['vocabulary', 'grammar', 'reading', 'listening'].includes(item.area) &&
      typeof item.prompt === 'string' && typeof item.answer === 'string' &&
      Array.isArray(item.choices) && item.choices.every((choice: unknown) => typeof choice === 'string') &&
      typeof item.explanation === 'string' && typeof item.savedAt === 'number');
  } catch {
    return [];
  }
}

export function mergeAttempts(current: WrongQuestion[], attempts: QuestionAttempt[]): WrongQuestion[] {
  const next = new Map(current.map((question) => [question.id, question]));
  for (const { question, selected } of attempts) {
    if (selected === question.answer) next.delete(question.id);
    else next.set(question.id, question);
  }
  return [...next.values()].sort((a, b) => b.savedAt - a.savedAt);
}
