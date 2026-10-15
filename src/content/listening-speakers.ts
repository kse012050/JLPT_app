export type ListeningUtterance = { speaker: string; text: string };

const speakerMarker = /(電話の相手|知らない人|配達員|先生|生徒|友達|同僚|店員|女|男)：/gu;

export function splitListeningTranscript(transcript: string): ListeningUtterance[] {
  const markers = [...transcript.matchAll(speakerMarker)];
  if (markers.length === 0) return transcript.trim() ? [{ speaker: 'ナレーション', text: transcript.trim() }] : [];

  const utterances: ListeningUtterance[] = [];
  const opening = transcript.slice(0, markers[0].index).trim();
  if (opening) utterances.push({ speaker: 'ナレーション', text: opening });

  for (const [index, marker] of markers.entries()) {
    const text = transcript.slice(marker.index + marker[0].length, markers[index + 1]?.index ?? transcript.length).trim();
    if (text) utterances.push({ speaker: marker[1], text });
  }
  return utterances;
}
