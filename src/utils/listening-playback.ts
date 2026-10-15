import * as Speech from 'expo-speech';

import { splitListeningTranscript } from '@/content/listening-speakers';

let playbackId = 0;
let japaneseVoices: Promise<Speech.Voice[]> | null = null;
let pendingStop: Promise<void> = Promise.resolve();

function availableJapaneseVoices(): Promise<Speech.Voice[]> {
  japaneseVoices ??= Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const available = voices.filter((voice) => voice.language.toLowerCase().startsWith('ja'));
      if (!available.length) japaneseVoices = null;
      return available;
    })
    .catch(() => { japaneseVoices = null; return []; });
  return japaneseVoices;
}

function queueStop(): Promise<void> {
  const current = pendingStop.then(() => Speech.stop());
  pendingStop = current.catch(() => {});
  return current;
}

export async function stopListeningPlayback(): Promise<void> {
  playbackId += 1;
  await queueStop();
}

export async function playListeningTranscript(transcript: string, onError: () => void): Promise<void> {
  const currentId = ++playbackId;
  await queueStop();
  const utterances = splitListeningTranscript(transcript);
  if (!utterances.length || currentId !== playbackId) return;

  const voices = await availableJapaneseVoices();
  if (currentId !== playbackId) return;
  const speakers = [...new Set(utterances.map((utterance) => utterance.speaker))];

  const speakNext = (index: number): void => {
    if (currentId !== playbackId || index >= utterances.length) return;
    const utterance = utterances[index];
    const speakerIndex = speakers.indexOf(utterance.speaker);
    const voice = voices.length ? voices[speakerIndex % voices.length] : undefined;
    try {
      Speech.speak(utterance.text, {
        language: 'ja-JP',
        voice: voice?.identifier,
        rate: 0.9,
        pitch: voices.length > 1 || speakers.length === 1 ? 1 : speakerIndex % 2 === 0 ? 0.94 : 1.07,
        onDone: () => speakNext(index + 1),
        onError: () => { if (currentId === playbackId) onError(); },
      });
    } catch {
      if (currentId === playbackId) onError();
    }
  };

  speakNext(0);
}
