import Storage from 'expo-sqlite/kv-store';

const KEY = 'vocabulary.completed-units.v1';

export async function getCompletedVocabularyUnits(): Promise<string[]> {
  const value = await Storage.getItem(KEY);
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveCompletedVocabularyUnit(unitId: string): Promise<string[]> {
  const completed = await getCompletedVocabularyUnits();
  const next = completed.includes(unitId) ? completed : [...completed, unitId];
  await Storage.setItem(KEY, JSON.stringify(next));
  return next;
}
