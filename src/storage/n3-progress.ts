import Storage from 'expo-sqlite/kv-store';

export type N3Result = { score: number; total: number };
export type N3Results = Record<string, N3Result>;
const KEY = 'n3.study-results.v1';

export async function getN3Results(): Promise<N3Results> {
  const saved = await Storage.getItem(KEY);
  if (!saved) return {};
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) =>
      !!value && typeof value === 'object' && 'score' in value && 'total' in value &&
      typeof value.score === 'number' && typeof value.total === 'number')) as N3Results;
  } catch {
    return {};
  }
}

export async function saveN3Result(unitId: string, score: number, total: number): Promise<N3Results> {
  const current = await getN3Results();
  const previous = current[unitId];
  const next = { ...current, [unitId]: previous && previous.total === total && previous.score > score ? previous : { score, total } };
  await Storage.setItem(KEY, JSON.stringify(next));
  return next;
}
