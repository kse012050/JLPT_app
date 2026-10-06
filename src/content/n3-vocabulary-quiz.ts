import { bankByLevel, type BankLevel, type BankWord } from './n3-vocabulary-bank';

export const BANK_BATCH_SIZE = 20;
export type BankQuestion = { word: BankWord; choices: string[]; answer: string };

export function batchCount(level: BankLevel): number {
  return Math.ceil(bankByLevel[level].length / BANK_BATCH_SIZE);
}

export function wordsForBatch(level: BankLevel, batch: number): readonly BankWord[] {
  const start = batch * BANK_BATCH_SIZE;
  return bankByLevel[level].slice(start, start + BANK_BATCH_SIZE);
}

export function resultKey(level: BankLevel, batch: number): string {
  return `vocabulary-bank-${level}-${batch}`;
}

export function questionsForBatch(level: BankLevel, batch: number): BankQuestion[] {
  return wordsForBatch(level, batch).map((word, index) => {
    const answer = word.meaningKo!;
    const pool = bankByLevel.N5.concat(bankByLevel.N4, bankByLevel.N3)
      .map((candidate) => candidate.meaningKo!);
    const candidates = [...new Set(pool)].filter((candidate) => candidate !== answer);
    const offset = (batch * BANK_BATCH_SIZE + index * 97) % candidates.length;
    const distractors: string[] = [];
    for (let step = 0; distractors.length < 3; step++) {
      const candidate = candidates[(offset + step) % candidates.length];
      if (!distractors.includes(candidate)) distractors.push(candidate);
    }
    const choices = [...distractors];
    choices.splice(index % 4, 0, answer);
    return { word, choices, answer };
  });
}
