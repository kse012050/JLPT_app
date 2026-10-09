import reference from './openjlpt-n3-reference.json';
import { n3GrammarKo, prerequisiteGrammarMeanings } from './n3-grammar-ko';
import { n3GrammarPractice } from './n3-grammar-practice';
import { prerequisiteGrammarDetails } from './prerequisite-grammar-details';
import { n3GrammarSupplement } from './n3-grammar-supplement';
import type { ChoiceQuestion, GrammarEntry, N3Unit } from './n3';

export type GrammarLevel = 'N3' | 'N4' | 'N5';
export const grammarCounts = { N3: 182, N4: 98, N5: 81, total: 361 } as const;

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

const openJlptN3GrammarEntries: readonly GrammarEntry[] = source.map((entry, index) => {
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
    additionalExamples: entry.examples.slice(1),
    translation: ko.translation,
    question,
  };
});

export const n3GrammarEntries: readonly GrammarEntry[] = [...openJlptN3GrammarEntries, ...n3GrammarSupplement];

const unitSize = 8;
export const n3GrammarUnits: readonly N3Unit[] = Array.from({ length: Math.ceil(n3GrammarEntries.length / unitSize) }, (_, index) => {
  const grammar = n3GrammarEntries.slice(index * unitSize, (index + 1) * unitSize);
  return {
    id: `n3-grammar-bank-${index}`,
    area: 'grammar',
    grammarLevel: 'N3',
    title: `N3 문법 ${index + 1}단원`,
    description: `${grammar[0].pattern}부터 ${grammar[grammar.length - 1].pattern}까지 · ${grammar.length}개 표현`,
    grammar,
    questions: n3GrammarPractice.filter((_, questionIndex) => questionIndex % Math.ceil(n3GrammarEntries.length / unitSize) === index),
  };
});

function makePrerequisiteEntries(level: 'N4' | 'N5'): GrammarEntry[] {
  const entries = reference.levels[level].grammar;
  const meanings = entries.map((entry) => grammarMeaningKo(level, entry.id));
  return entries.map((entry, index) => {
    const detail = prerequisiteGrammarDetails[level][entry.id];
    const meaning = meanings[index];
    const choices = [meaning];
    for (let offset = 1; choices.length < 4 && offset < entries.length; offset++) {
      const candidate = meanings[(index + offset * 11) % entries.length];
      if (candidate && !choices.includes(candidate)) choices.push(candidate);
    }
    choices.splice(0, 1);
    choices.splice(index % 4, 0, meaning);
    const pattern = grammarPatternKo(entry.pattern);
    return {
      pattern,
      focus: detail.focus,
      meaning,
      formation: grammarFormationKo(entry.formation),
      explanation: detail.explanation,
      example: entry.examples[0].ja,
      furigana: entry.examples[0].furigana,
      additionalExamples: entry.examples.slice(1),
      translation: detail.translation,
      question: {
        kind: '문법 뜻·문맥',
        prompt: `다음 예문에서 「${pattern}」의 쓰임에 맞는 뜻을 고르세요.\n${entry.examples[0].ja}`,
        choices: choices as [string, string, string, string],
        answer: meaning,
        explanation: `${pattern}: ${detail.explanation}\n${entry.examples[0].ja}\n${detail.translation}`,
      },
    };
  });
}

export const prerequisiteGrammarEntries: Record<'N4' | 'N5', readonly GrammarEntry[]> = {
  N4: makePrerequisiteEntries('N4'),
  N5: makePrerequisiteEntries('N5'),
};

export const prerequisiteGrammarUnits: readonly N3Unit[] = (['N4', 'N5'] as const).flatMap((level) => {
  const entries = prerequisiteGrammarEntries[level];
  return Array.from({ length: Math.ceil(entries.length / unitSize) }, (_, index) => {
    const grammar = entries.slice(index * unitSize, (index + 1) * unitSize);
    return {
      id: `${level.toLowerCase()}-grammar-bank-${index}`,
      area: 'grammar' as const,
      grammarLevel: level,
      title: `${level} 문법 ${index + 1}단원`,
      description: `${grammar[0].pattern}부터 ${grammar[grammar.length - 1].pattern}까지 · ${grammar.length}개 표현`,
      grammar,
    };
  });
});
