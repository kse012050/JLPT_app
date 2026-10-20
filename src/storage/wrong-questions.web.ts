import { mergeAttempts, parseWrongQuestions, type QuestionAttempt } from './wrong-questions-core';

export type { WrongQuestion, ReviewArea, QuestionAttempt } from './wrong-questions-core';
export { reviewQuestion } from './wrong-questions-core';

const KEY = 'jlpt.wrong-questions.v1';
let pending: Promise<unknown> = Promise.resolve();

async function readWrongQuestions() {
  if (typeof window === 'undefined') return [];
  return parseWrongQuestions(window.localStorage.getItem(KEY));
}

export async function getWrongQuestions() {
  await pending.catch(() => undefined);
  return readWrongQuestions();
}

export function saveQuestionAttempts(attempts: QuestionAttempt[]) {
  const operation = pending.catch(() => undefined).then(async () => {
    const next = mergeAttempts(await readWrongQuestions(), attempts);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  });
  pending = operation;
  return operation;
}
