import reference from './openjlpt-n3-reference.json';
import { n3GrammarKo, prerequisiteGrammarMeanings } from './n3-grammar-ko';
import { n3GrammarPractice } from './n3-grammar-practice';
import type { ChoiceQuestion, GrammarEntry, N3Unit } from './n3';

export type GrammarLevel = 'N3' | 'N4' | 'N5';
export const grammarCounts = { N3: 101, N4: 98, N5: 81, total: 280 } as const;

const formationTerms: Record<string, string> = {
  'Verb-nai stem': '동사 ない형 어간',
  'Verb-volitional': '동사 의지형',
  'Verb-plain': '동사 보통형',
  'Verb-dict': '동사 사전형',
  'Verb-stem': '동사 ます형 어간',
  'Verb-nai': '동사 ない형',
  'Verb-te': '동사 て형',
  'Verb-ta': '동사 た형',
  'Verb-ba': '동사 ば형',
  'i-Adj stem': 'い형용사 어간',
  'i-Adj-ku': 'い형용사 く형',
  'i-Adj': 'い형용사',
  'na-Adj': 'な형용사',
  Noun: '명사',
  Sentence: '문장',
};
const formationPattern = new RegExp(Object.keys(formationTerms).sort((a, b) => b.length - a.length).join('|'), 'g');

export function grammarFormationKo(formation: string): string {
  return formation.replace(formationPattern, (term) => formationTerms[term])
    .replaceAll('receiver', '받는 사람')
    .replaceAll('giver', '주는 사람')
    .replaceAll('Group 1', '1그룹')
    .replaceAll('Group 2', '2그룹')
    .replaceAll('final u → e', '마지막 う단 → え단')
    .replaceAll('final u → o', '마지막 う단 → お단')
    .replaceAll('short form', '줄인 형태')
    .replaceAll('Question word', '의문사')
    .replaceAll('plain', '보통형')
    .replaceAll('quantity', '수량')
    .replaceAll('number + counter', '숫자 + 조수사');
}

export function grammarPatternKo(pattern: string): string {
  return pattern.replace(/（[^）]*[A-Za-z][^）]*）/gu, '');
}

export function grammarMeaningKo(level: GrammarLevel, id: string): string {
  if (level === 'N3') return reference.levels.N3.grammar.find((entry) => entry.id === id)?.meaningKo.replaceAll(';', ',') ?? '';
  return prerequisiteGrammarMeanings[level][id] ?? '';
}

const source = reference.levels.N3.grammar;
const focusPool = [...new Set(source.map((entry) => n3GrammarKo[entry.id]?.focus).filter((value): value is string => Boolean(value)))];

export const n3GrammarEntries: readonly GrammarEntry[] = source.map((entry, index) => {
  const ko = n3GrammarKo[entry.id];
  const meaning = grammarMeaningKo('N3', entry.id);
  const answer = ko.focus;
  const candidates = focusPool.filter((focus) => focus !== answer);
  const distractors = [0, 1, 2].map((offset) => candidates[(index * 13 + offset * 29) % candidates.length]);
  const choices = [...distractors];
  choices.splice(index % 4, 0, answer);
  const question: ChoiceQuestion = {
    kind: '예문 복원',
    prompt: `${entry.examples[0].ja.replace(answer, '（　）')}\n「${meaning}」에 맞는 표현을 고르세요.`,
    choices: choices as [string, string, string, string],
    answer,
    explanation: `${grammarPatternKo(entry.pattern)}: ${ko.explanation}\n${ko.translation}`,
  };
  return {
    pattern: grammarPatternKo(entry.pattern),
    focus: ko.focus,
    furigana: entry.examples[0].furigana,
    meaning,
    formation: grammarFormationKo(entry.formation),
    explanation: ko.explanation,
    example: entry.examples[0].ja,
    translation: ko.translation,
    question,
  };
});

const unitSize = 8;
export const n3GrammarUnits: readonly N3Unit[] = Array.from({ length: Math.ceil(n3GrammarEntries.length / unitSize) }, (_, index) => {
  const grammar = n3GrammarEntries.slice(index * unitSize, (index + 1) * unitSize);
  return {
    id: `n3-grammar-bank-${index}`,
    area: 'grammar',
    title: `N3 문법 ${index + 1}단원`,
    description: `${grammar[0].pattern}부터 ${grammar[grammar.length - 1].pattern}까지 · ${grammar.length}개 표현`,
    grammar,
    questions: n3GrammarPractice.filter((_, questionIndex) => questionIndex % Math.ceil(n3GrammarEntries.length / unitSize) === index),
  };
});
