import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import reference from '@/content/n3-kanji-reference.json';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';

const items: readonly (readonly [string, string])[] = reference.items.map(([word, reading]) => [word, reading] as const);
const batchSize = 20;
const batchCount = Math.ceil(items.length / batchSize);
const colors = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', greenPale: '#E5F8EF', line: '#ECE9F0' };
const fonts = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular', jpBold: 'NotoSansJP_700Bold', number: 'PlusJakartaSans_700Bold' };

function choicesFor(itemIndex: number): string[] {
  const answer = items[itemIndex][1];
  const choices = [answer];
  for (let offset = 1; choices.length < 4 && offset < items.length; offset++) {
    const candidate = items[(itemIndex + offset) % items.length][1];
    if (!choices.includes(candidate)) choices.push(candidate);
  }
  const answerPosition = itemIndex % 4;
  choices.splice(0, 1);
  choices.splice(answerPosition, 0, answer);
  return choices;
}

export default function N3KanjiDrillScreen() {
  const [batch, setBatch] = useState(0);
  const [stage, setStage] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<N3Results>({});
  const [saveError, setSaveError] = useState(false);
  const batchItems = useMemo(() => items.slice(batch * batchSize, (batch + 1) * batchSize), [batch]);
  const itemIndex = batch * batchSize + questionIndex;
  const current = batchItems[questionIndex];
  const choices = useMemo(() => current ? choicesFor(itemIndex) : [], [current, itemIndex]);
  const saved = results[`n3-kanji-${batch}`];

  useEffect(() => { getN3Results().then(setResults).catch(() => setSaveError(true)); }, []);

  function start() {
    setQuestionIndex(0);
    setSelected(null);
    setCorrect(0);
    setStage('quiz');
  }

  function changeBatch(delta: number) {
    setBatch((value) => Math.max(0, Math.min(batchCount - 1, value + delta)));
    setStage('intro');
  }

  async function next() {
    if (selected === null) return;
    if (questionIndex < batchItems.length - 1) {
      setQuestionIndex((value) => value + 1);
      setSelected(null);
      return;
    }
    setStage('result');
    try { setResults(await saveN3Result(`n3-kanji-${batch}`, correct, batchItems.length)); }
    catch { setSaveError(true); }
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><HeaderBackButton onPress={() => stage === 'intro' ? router.back() : setStage('intro')} /><Text style={s.headerTitle}>N3 한자 읽기 연습</Text><View style={s.back} /></View>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}><View style={s.content}>
      {stage === 'intro' ? <>
        <View style={s.hero}><Text style={s.eyebrow}>N3 · 공개 참고 목록</Text><Text style={s.heroTitle}>한자 읽기 {items.length}개</Text><Text style={s.heroText}>20개씩 읽기를 확인하세요. 여러 읽기가 가능한 표기, 드문 표기와 미완성 항목은 제외했습니다. 이 목록은 공식 지정 어휘가 아니며 뜻·문맥·용법 연습을 대체하지 않습니다.</Text><Text style={s.heroProgress}>{Object.keys(results).filter((key) => key.startsWith('n3-kanji-')).length} / {batchCount} 묶음 풀이 기록</Text></View>
        <View style={s.batchCard}><Text style={s.batchLabel}>현재 묶음</Text><Text style={s.batchNumber}>{batch + 1} / {batchCount}</Text><Text style={s.batchRange}>{batch * batchSize + 1}–{batch * batchSize + batchItems.length}번 · {batchItems.length}문제</Text>{saved ? <Text style={s.saved}>이전 최고 점수 {saved.score}/{saved.total}</Text> : null}<View style={s.batchButtons}><Pressable onPress={() => changeBatch(-1)} disabled={batch === 0} style={[s.smallButton, batch === 0 && s.disabled]} accessibilityRole="button"><Text style={s.smallButtonText}>이전 묶음</Text></Pressable><Pressable onPress={() => changeBatch(1)} disabled={batch === batchCount - 1} style={[s.smallButton, batch === batchCount - 1 && s.disabled]} accessibilityRole="button"><Text style={s.smallButtonText}>다음 묶음</Text></Pressable></View><Pressable onPress={start} style={s.primaryButton} accessibilityRole="button"><Text style={s.primaryText}>읽기 문제 시작</Text></Pressable></View>
        <View style={s.sourceCard}><Text style={s.sourceTitle}>자료 출처</Text><Text style={s.sourceText}>Jonathan Waller의 비공식 JLPT 목록을 stephenmk가 정리한 자료입니다. JMdict의 일반 표기와 첫 번째 일반 읽기를 대조했습니다. 이 읽기 목록은 CC BY-SA 4.0 조건으로 제공합니다.</Text><Link href="https://github.com/stephenmk/yomitan-jlpt-vocab" target="_blank" style={s.sourceLink}>원본 목록 보기 ↗</Link><Link href="https://www.edrdg.org/edrdg/licence.html" target="_blank" style={s.sourceLink}>JMdict 출처 보기 ↗</Link><Link href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" style={s.sourceLink}>CC BY-SA 4.0 라이선스 보기 ↗</Link></View>
      </> : null}
      {stage === 'quiz' && current ? <>
        <View style={s.progressRow}><Text style={s.eyebrow}>묶음 {batch + 1} · 한자 읽기</Text><Text style={s.progressCount}>{questionIndex + 1} / {batchItems.length}</Text></View><View style={s.track}><View style={[s.trackFill, { width: `${((questionIndex + 1) / batchItems.length) * 100}%` }]} /></View>
        <View style={s.questionCard}><Text style={s.questionLabel}>읽기를 고르세요</Text><Text style={s.questionWord}>{current[0]}</Text></View>
        <View style={s.choices}>{choices.map((choice) => <Pressable key={choice} onPress={() => { setSelected(choice); if (choice === current[1]) setCorrect((value) => value + 1); }} disabled={selected !== null} style={[s.choice, selected !== null && choice === current[1] && s.choiceCorrect, selected === choice && choice !== current[1] && s.choiceWrong]} accessibilityRole="button"><Text style={s.choiceText}>{choice}</Text></Pressable>)}</View>
        {selected !== null ? <View style={[s.feedback, selected === current[1] ? s.feedbackCorrect : s.feedbackWrong]}><Text style={s.feedbackTitle}>{selected === current[1] ? '정답이에요!' : `정답: ${current[1]}`}</Text><Text style={s.feedbackText}>{current[0]} · {current[1]}</Text></View> : null}
      </> : null}
      {stage === 'result' ? <View style={s.resultCard}><Text style={s.resultTitle}>묶음을 모두 풀었어요</Text><Text style={s.resultScore}>{correct} / {batchItems.length}</Text><Text style={s.heroText}>이 점수는 한자 읽기 연습 결과입니다. N3 언어지식의 실제 점수나 합격 가능성으로 환산할 수 없습니다.</Text><Pressable onPress={start} style={s.primaryButton} accessibilityRole="button"><Text style={s.primaryText}>다시 풀기</Text></Pressable><Pressable onPress={() => changeBatch(1)} disabled={batch === batchCount - 1} style={[s.smallButton, batch === batchCount - 1 && s.disabled]} accessibilityRole="button"><Text style={s.smallButtonText}>다음 묶음으로</Text></Pressable></View> : null}
      {saveError ? <Text style={s.error}>학습 기록을 저장하거나 불러오지 못했습니다.</Text> : null}
    </View></ScrollView>
    {stage === 'quiz' && selected !== null ? <View style={s.bottom}><Pressable onPress={next} style={s.primaryButton} accessibilityRole="button"><Text style={s.primaryText}>{questionIndex === batchItems.length - 1 ? '결과 보기' : '다음 문제'}</Text></Pressable></View> : null}
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }, back: { width: 40, height: 40 }, headerTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 },
  scroll: { flexGrow: 1, paddingBottom: 24 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 },
  hero: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 19, padding: 20 }, eyebrow: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, heroTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 21, marginTop: 7 }, heroText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 21, marginTop: 10 }, heroProgress: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 14 },
  batchCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 18, marginTop: 14 }, batchLabel: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, batchNumber: { color: colors.ink, fontFamily: fonts.number, fontSize: 26, marginTop: 6 }, batchRange: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 }, saved: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 8 }, batchButtons: { flexDirection: 'row', gap: 9, marginTop: 17, marginBottom: 12 }, smallButton: { flex: 1, height: 42, borderWidth: 1, borderColor: colors.pink, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, smallButtonText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 12 }, disabled: { opacity: 0.35 }, primaryButton: { height: 48, backgroundColor: colors.pink, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 }, primaryText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 },
  sourceCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, marginTop: 14 }, sourceTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 }, sourceText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 19, marginTop: 7 }, sourceLink: { color: colors.pink, fontFamily: fonts.semi, fontSize: 11, marginTop: 9 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' }, progressCount: { color: colors.muted, fontFamily: fonts.number, fontSize: 12 }, track: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden', marginTop: 11, marginBottom: 18 }, trackFill: { height: 6, backgroundColor: colors.pink }, questionCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 20, alignItems: 'center' }, questionLabel: { color: colors.pink, fontFamily: fonts.bold, fontSize: 12 }, questionWord: { color: colors.ink, fontFamily: fonts.jpBold, fontSize: 34, marginTop: 12 }, choices: { marginTop: 14, gap: 9 }, choice: { minHeight: 52, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: 15 }, choiceCorrect: { borderColor: colors.green, backgroundColor: colors.greenPale }, choiceWrong: { borderColor: colors.pink, backgroundColor: colors.pale }, choiceText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 16 }, feedback: { borderRadius: 11, padding: 14, marginTop: 14 }, feedbackCorrect: { backgroundColor: colors.greenPale }, feedbackWrong: { backgroundColor: colors.pale }, feedbackTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 }, feedbackText: { color: colors.muted, fontFamily: fonts.jp, fontSize: 13, marginTop: 5 },
  resultCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 22, marginTop: 18 }, resultTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 19 }, resultScore: { color: colors.pink, fontFamily: fonts.number, fontSize: 28, marginTop: 8 }, error: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, marginTop: 12 }, bottom: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 18, paddingVertical: 10 },
});
