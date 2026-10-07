import { bankByLevel, type BankLevel, type BankWord } from './n3-vocabulary-bank';

export const BANK_BATCH_SIZE = 20;
export type QuizMode = 'meaning' | 'reading' | 'orthography';
export type BankQuestion = {
  word: BankWord;
  mode: QuizMode;
  prompt: string;
  choices: string[];
  answer: string;
};

const allWords = [...bankByLevel.N5, ...bankByLevel.N4, ...bankByLevel.N3];
const kanjiWords = allWords.filter((word) => /[\u3400-\u9fff]/u.test(word.word));

export function batchCount(level: BankLevel): number {
  return Math.ceil(bankByLevel[level].length / BANK_BATCH_SIZE);
}

export function wordsForBatch(level: BankLevel, batch: number): readonly BankWord[] {
  const start = batch * BANK_BATCH_SIZE;
  return bankByLevel[level].slice(start, start + BANK_BATCH_SIZE);
}

export function resultKey(level: BankLevel, batch: number, mode: QuizMode = 'meaning'): string {
  const base = `vocabulary-bank-${level}-${batch}`;
  return mode === 'meaning' ? base : `${base}-${mode}`;
}

function choicesFor(word: BankWord, index: number, batch: number, mode: QuizMode): string[] {
  const answer = mode === 'meaning' ? word.meaningKo! : mode === 'reading' ? word.reading : word.word;
  const pool = mode === 'meaning' ? allWords : kanjiWords;
  const answerSenses = new Set(word.meaningKo?.split(',').map((sense) => sense.trim()) ?? []);
  const candidates = [...new Set(pool.filter((candidate) => {
    if (candidate.id === word.id) return false;
    if (mode === 'reading' && candidate.word === word.word) return false;
    if (mode === 'orthography' && candidate.reading === word.reading) return false;
    if (mode === 'meaning' && candidate.meaningKo?.split(',').some((sense) => answerSenses.has(sense.trim()))) return false;
    return true;
  }).map((candidate) => mode === 'meaning' ? candidate.meaningKo! : mode === 'reading' ? candidate.reading : candidate.word))]
    .filter((choice) => choice !== answer);
  const offset = (batch * BANK_BATCH_SIZE + index * 97) % candidates.length;
  const distractors = Array.from({ length: 3 }, (_, step) => candidates[(offset + step) % candidates.length]);
  const choices = [...distractors];
  choices.splice(index % 4, 0, answer);
  return choices;
}

export function questionsForBatch(level: BankLevel, batch: number, mode: QuizMode = 'meaning'): BankQuestion[] {
  return wordsForBatch(level, batch)
    .filter((word) => mode === 'meaning' || /[\u3400-\u9fff]/u.test(word.word))
    .map((word, index) => ({
      word,
      mode,
      prompt: mode === 'meaning' ? word.word : mode === 'reading' ? word.word : word.reading,
      answer: mode === 'meaning' ? word.meaningKo! : mode === 'reading' ? word.reading : word.word,
      choices: choicesFor(word, index, batch, mode),
    }));
}
