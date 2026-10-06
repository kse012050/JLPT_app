import * as Speech from 'expo-speech';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isKanji, kanaToHangul, kanjiHunEum } from '@/content/japanese-reading';

type KanjiPopover = { character: string; x: number; y: number; width: number; height: number };

const popoverWidth = 220;
const popoverHeight = 82;
const margin = 12;
let latestSpeechRequest = 0;

async function speakJapanese(reading: string, onError: () => void) {
  const request = ++latestSpeechRequest;
  try {
    await Speech.stop();
    if (request !== latestSpeechRequest) return;
    Speech.speak(reading, {
      language: 'ja-JP',
      rate: 0.9,
      onError: () => { if (request === latestSpeechRequest) onError(); },
    });
  } catch {
    if (request === latestSpeechRequest) onError();
  }
}

export function InteractiveJapaneseWord({ word, reading }: { word: string; reading: string }) {
  const [readingOpen, setReadingOpen] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [popover, setPopover] = useState<KanjiPopover | null>(null);
  const characterRefs = useRef<Record<number, View | null>>({});
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  function showKanji(character: string, index: number) {
    setReadingOpen(false);
    characterRefs.current[index]?.measureInWindow((x, y, width, height) => {
      setPopover({ character, x, y, width, height });
    });
  }

  const left = popover ? Math.max(margin, Math.min(popover.x + popover.width / 2 - popoverWidth / 2, screenWidth - popoverWidth - margin)) : 0;
  const above = popover ? popover.y - popoverHeight - 10 >= insets.top + margin : true;
  const top = popover ? above
    ? popover.y - popoverHeight - 10
    : Math.min(popover.y + popover.height + 10, screenHeight - insets.bottom - popoverHeight - margin) : 0;
  const arrowLeft = popover ? Math.max(12, Math.min(popover.x + popover.width / 2 - left - 7, popoverWidth - 26)) : 0;

  return <View>
    <View style={s.wordRow}>
      {Array.from(word).map((character, index) => isKanji(character)
        ? <Pressable key={`${index}-${character}`} ref={(node) => { characterRefs.current[index] = node; }} onPress={() => showKanji(character, index)} accessibilityRole="button" accessibilityLabel={`${character} 한자 뜻과 음 보기`} style={s.characterButton}><Text style={s.word}>{character}</Text></Pressable>
        : <Text key={`${index}-${character}`} style={s.word}>{character}</Text>)}
    </View>
    <Pressable onPress={() => { setPopover(null); setReadingOpen(true); setSpeechError(false); void speakJapanese(reading, () => setSpeechError(true)); }} accessibilityRole="button" accessibilityLabel={`${reading} 일본어 발음 듣고 한글 표기 보기`} style={s.readingButton}><Text style={[s.reading, readingOpen && s.active]}>{reading} <Text style={s.hint}>눌러서 발음 듣기·한글 표기 보기</Text></Text></Pressable>
    {speechError ? <Text style={s.speechError}>음성을 재생하지 못했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}
    {readingOpen ? <View style={s.readingDetail} accessibilityLiveRegion="polite"><Text style={s.detailLabel}>한글 발음</Text><Text style={s.detailText}>{reading} → {kanaToHangul(reading)}</Text></View> : null}
    {popover ? <Modal transparent visible animationType="fade" onRequestClose={() => setPopover(null)}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setPopover(null)} accessibilityRole="button" accessibilityLabel="한자 설명 닫기" />
        <View style={[s.popover, { left, top, width: popoverWidth, height: popoverHeight }]} accessibilityLiveRegion="polite">
          <View style={s.popoverHeader}><Text style={s.detailLabel}>한자 뜻과 음</Text><Pressable onPress={() => setPopover(null)} style={s.closeButton} accessibilityRole="button" accessibilityLabel="한자 말풍선 닫기"><Text style={s.closeText}>×</Text></Pressable></View>
          <Text style={s.detailText}>{popover.character} · {kanjiHunEum(popover.character) ?? '한국식 훈음 자료가 없습니다'}</Text>
          <View style={[above ? s.arrowDown : s.arrowUp, { left: arrowLeft }]} />
        </View>
      </View>
    </Modal> : null}
  </View>;
}

const s = StyleSheet.create({
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  characterButton: { minHeight: 32, justifyContent: 'center' },
  word: { color: '#201F24', fontFamily: 'NotoSansJP_700Bold', fontSize: 21 },
  active: { color: '#E82E5A' },
  readingButton: { alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center' },
  reading: { color: '#E82E5A', fontFamily: 'NotoSansJP_400Regular', fontSize: 13 },
  hint: { color: '#797681', fontFamily: 'NotoSansKR_400Regular', fontSize: 10 },
  speechError: { color: '#B90538', fontFamily: 'NotoSansKR_400Regular', fontSize: 10, marginTop: 3 },
  readingDetail: { backgroundColor: '#FFF0F4', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, marginTop: 5 },
  detailLabel: { color: '#E82E5A', fontFamily: 'NotoSansKR_700Bold', fontSize: 10 },
  detailText: { color: '#201F24', fontFamily: 'NotoSansKR_600SemiBold', fontSize: 13, marginTop: 4 },
  overlay: { flex: 1 },
  popover: { position: 'absolute', backgroundColor: '#FFF0F4', borderColor: '#F4C6D3', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingTop: 8, elevation: 7, shadowColor: '#201F24', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  popoverHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#797681', fontSize: 22, lineHeight: 25 },
  arrowDown: { position: 'absolute', top: popoverHeight - 1, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFF0F4' },
  arrowUp: { position: 'absolute', top: -8, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#FFF0F4' },
});
