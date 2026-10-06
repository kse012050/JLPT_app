import type { N3Results } from './n3-progress';

const KEY = 'n3.study-results.v1';

export async function getN3Results(): Promise<N3Results> {
  if (typeof window === 'undefined') return {};
  const saved = window.localStorage.getItem(KEY);
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
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
