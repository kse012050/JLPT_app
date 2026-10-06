const KEY = 'jlpt.reference-studied.v1';

export async function getReferenceProgress(): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  const saved = window.localStorage.getItem(KEY);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveReferenceProgress(ids: string[]): Promise<void> {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
}
