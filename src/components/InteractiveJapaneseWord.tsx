import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isKanji, kanaToHangul, kanjiHunEum } from '@/content/japanese-reading';

type Detail = { type: 'reading' } | { type: 'kanji'; character: string };

export function InteractiveJapaneseWord({ word, reading }: { word: string; reading: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);

  function toggle(next: Detail) {
    setDetail((current) => current?.type === next.type && (next.type === 'reading' || (current.type === 'kanji' && current.character === next.character)) ? null : next);
  }

  return <View>
    <View style={s.wordRow}>
      {Array.from(word).map((character, index) => isKanji(character)
        ? <Pressable key={`${index}-${character}`} onPress={() => toggle({ type: 'kanji', character })} accessibilityRole="button" accessibilityLabel={`${character} 한자 뜻과 음 보기`} style={s.characterButton}><Text style={[s.word, detail?.type === 'kanji' && detail.character === character && s.active]}>{character}</Text></Pressable>
        : <Text key={`${index}-${character}`} style={s.word}>{character}</Text>)}
    </View>
    <Pressable onPress={() => toggle({ type: 'reading' })} accessibilityRole="button" accessibilityLabel={`${reading} 한글 발음 보기`} style={s.readingButton}><Text style={[s.reading, detail?.type === 'reading' && s.active]}>{reading} <Text style={s.hint}>눌러서 한글 발음 보기</Text></Text></Pressable>
    {detail ? <View style={s.detail} accessibilityLiveRegion="polite"><Text style={s.detailLabel}>{detail.type === 'reading' ? '한글 발음' : '한자 뜻과 음'}</Text><Text style={s.detailText}>{detail.type === 'reading' ? `${reading} → ${kanaToHangul(reading)}` : `${detail.character} · ${kanjiHunEum(detail.character) ?? '한국식 훈음 자료가 없습니다'}`}</Text></View> : null}
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
  detail: { backgroundColor: '#FFF0F4', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, marginTop: 5 },
  detailLabel: { color: '#E82E5A', fontFamily: 'NotoSansKR_700Bold', fontSize: 10 },
  detailText: { color: '#201F24', fontFamily: 'NotoSansKR_600SemiBold', fontSize: 13, marginTop: 3 },
});
