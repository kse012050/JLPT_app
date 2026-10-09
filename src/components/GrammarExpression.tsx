import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type TextStyle, View } from 'react-native';

import { grammarFocus, grammarHangul, grammarReading, grammarSentenceReading, grammarSpokenReading } from '@/content/grammar-display';

type Props = { pattern: string; example: string; focus?: string; furigana?: string; compact?: boolean };

export function GrammarExpression({ pattern, example, focus, furigana, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const request = useRef(0);
  const point = grammarFocus(pattern, example, focus);
  const spokenText = point || pattern.replace(/（[^）]*）/gu, '').split('/')[0].replace(/^〜/u, '').trim();
  const reading = grammarSpokenReading(pattern, grammarReading(example, furigana, point || spokenText));
  const hangul = grammarHangul(reading);

  useEffect(() => {
    const currentRequest = request;
    return () => { currentRequest.current++; void Speech.stop(); };
  }, [spokenText]);

  function play() {
    const current = ++request.current;
    setOpen(true);
    setSpeechError(false);
    void Speech.stop().then(() => {
      if (request.current !== current) return;
      Speech.speak(reading || spokenText, {
        language: 'ja-JP', rate: 0.9,
        onError: () => { if (request.current === current) setSpeechError(true); },
      });
    }).catch(() => { if (request.current === current) setSpeechError(true); });
  }

  return <View style={compact && s.compactContainer}>
    <Pressable onPress={play} accessibilityRole="button" accessibilityLabel={`${pattern} 일본어 발음 듣기`} style={s.button}>
      <Text style={[s.pattern, compact && s.compact]}>{pattern}</Text>
      <Text style={s.hint}>눌러서 발음 듣기·한글 표기 보기</Text>
    </Pressable>
    {open ? <View style={s.readingBox} accessibilityLiveRegion="polite">
      <Text style={s.readingLabel}>{hangul ? '한글 발음' : '예문 속 표현'}</Text>
      <Text style={s.readingText}>{hangul ? `${reading} → ${hangul}` : spokenText}</Text>
    </View> : null}
    {speechError ? <Text style={s.error}>음성을 재생하지 못했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}
  </View>;
}

export function GrammarExample({ text, focus, style }: { text: string; focus: string; style?: StyleProp<TextStyle> }) {
  const start = focus ? text.indexOf(focus) : -1;
  if (start < 0) return <Text style={style}>{text}</Text>;
  return <Text style={style}>{text.slice(0, start)}<Text style={s.highlight}>{focus}</Text>{text.slice(start + focus.length)}</Text>;
}

export function SpokenGrammarExample({ text, focus, furigana, style }: {
  text: string; focus: string; furigana?: string; style?: StyleProp<TextStyle>;
}) {
  const [open, setOpen] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const request = useRef(0);
  const kana = grammarSentenceReading(text, furigana);
  const hangul = grammarHangul(kana);

  useEffect(() => {
    const currentRequest = request;
    return () => { currentRequest.current++; void Speech.stop(); };
  }, [text]);

  function play() {
    const current = ++request.current;
    setOpen(true);
    setSpeechError(false);
    void Speech.stop().then(() => {
      if (request.current !== current) return;
      Speech.speak(text, {
        language: 'ja-JP', rate: 0.9,
        onError: () => { if (request.current === current) setSpeechError(true); },
      });
    }).catch(() => { if (request.current === current) setSpeechError(true); });
  }

  return <View>
    <Pressable onPress={play} accessibilityRole="button" accessibilityLabel={`${text} 예문 일본어 발음 듣기`}>
      <GrammarExample text={text} focus={focus} style={style} />
      <Text style={s.hint}>눌러서 예문 듣기·한글 표기 보기</Text>
    </Pressable>
    {open && hangul ? <View style={s.readingBox} accessibilityLiveRegion="polite">
      <Text style={s.readingLabel}>한글 발음</Text>
      <Text style={s.readingText}>{kana} → {hangul}</Text>
    </View> : null}
    {speechError ? <Text style={s.error}>음성을 재생하지 못했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}
  </View>;
}

const s = StyleSheet.create({
  compactContainer: { flex: 1, minWidth: 0 },
  button: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  pattern: { color: '#201F24', fontFamily: 'NotoSansJP_700Bold', fontSize: 32, marginTop: 8 },
  compact: { fontSize: 21, marginTop: 0 },
  hint: { color: '#E82E5A', fontFamily: 'NotoSansKR_400Regular', fontSize: 11, marginTop: 2 },
  readingBox: { alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: '#FFF0F4', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, marginTop: 7 },
  readingLabel: { color: '#E82E5A', fontFamily: 'NotoSansKR_700Bold', fontSize: 10 },
  readingText: { color: '#201F24', fontFamily: 'NotoSansJP_400Regular', fontSize: 13, marginTop: 4 },
  error: { color: '#B90538', fontFamily: 'NotoSansKR_400Regular', fontSize: 10, marginTop: 4 },
  highlight: { color: '#E82E5A', backgroundColor: '#FFE0E9', fontFamily: 'NotoSansJP_700Bold' },
});
