import reference from './openjlpt-n3-reference.json';
import korean from './openjlpt-reference-ko.json';
import { n3Units, type VocabularyEntry } from './n3';

export type BankLevel = 'N5' | 'N4' | 'N3';
export type BankWord = {
  id: string;
  word: string;
  reading: string;
  meaningsEn: readonly string[];
  meaningKo?: string;
  examples: readonly { ja: string; ko: string; tatoeba_id?: number }[];
  curatedExample?: string;
  curatedTranslation?: string;
};
const translations = korean as unknown as { levels: Record<BankLevel, { vocabulary: Record<string, { meanings: string[]; examples: string[] }> }> };

const keyOf = (word: string, reading: string) => `${word}\u0000${reading}`;
const curated = new Map<string, VocabularyEntry>(
  n3Units.flatMap((unit) => unit.vocabulary ?? []).map((entry) => [keyOf(entry.word, entry.reading), entry]),
);

const used = new Set<string>();
function fromReference(level: BankLevel): BankWord[] {
  return reference.levels[level].vocabulary.flatMap((entry) => {
    const key = keyOf(entry.word, entry.reading);
    if (used.has(key)) return [];
    used.add(key);
    const matched = curated.get(key);
    const translated = translations.levels[level].vocabulary[entry.id];
    return [{
      id: `${level}-${entry.id}`,
      word: entry.word,
      reading: entry.reading,
      meaningsEn: entry.meanings,
      meaningKo: matched?.meaning ?? translated.meanings.join('; '),
      examples: entry.examples.map((example, index) => ({ ja: example.ja, ko: translated.examples[index], tatoeba_id: example.tatoeba_id })),
      curatedExample: matched?.example,
      curatedTranslation: matched?.translation,
    }];
  });
}

const n5 = fromReference('N5');
const n4 = fromReference('N4');
const n3 = fromReference('N3');
for (const entry of curated.values()) {
  const key = keyOf(entry.word, entry.reading);
  if (used.has(key)) continue;
  used.add(key);
  n3.push({
    id: `N3-curated-${n3.length}`,
    word: entry.word,
    reading: entry.reading,
    meaningsEn: [],
    meaningKo: entry.meaning,
    examples: [],
    curatedExample: entry.example,
    curatedTranslation: entry.translation,
  });
}

export const bankByLevel: Record<BankLevel, readonly BankWord[]> = { N5: n5, N4: n4, N3: n3 };
export const bankCounts = { N5: n5.length, N4: n4.length, N3: n3.length, total: used.size };
