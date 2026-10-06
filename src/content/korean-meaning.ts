export function formatKoreanMeanings(meanings: readonly string[]): string {
  const unique = new Set<string>();
  for (const meaning of meanings) {
    const cleaned = meaning.trim();
    if (cleaned) unique.add(cleaned);
  }
  return [...unique].join(', ');
}
