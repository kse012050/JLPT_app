import Storage from 'expo-sqlite/kv-store';

const KEY = 'jlpt.reference-studied.v1';

export async function getReferenceProgress(): Promise<string[]> {
  const saved = await Storage.getItem(KEY);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveReferenceProgress(ids: string[]): Promise<void> {
  await Storage.setItem(KEY, JSON.stringify(ids));
}
