import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import { InteractiveJapaneseWord } from '@/components/InteractiveJapaneseWord';
import { bankByLevel, bankCounts, type BankLevel } from '@/content/n3-vocabulary-bank';
import { batchCount, questionsForBatch, resultKey, wordsForBatch, type QuizMode } from '@/content/n3-vocabulary-quiz';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';

type Stage = 'learn' | 'quiz' | 'result';
const levels: BankLevel[] = ['N3', 'N4', 'N5'];
const pink = '#E82E5A';
const ink = '#201F24';
const muted = '#797681';
const quizModes: { id: QuizMode; label: string }[] = [
  { id: 'meaning', label: '뜻' },
  { id: 'reading', label: '한자 읽기' },
  { id: 'orthography', label: '표기' },
];

export default function N3VocabularyBankScreen() {
  const params = useLocalSearchParams<{ level?: string; batch?: string }>();
  const initialLevel: BankLevel = levels.includes(params.level as BankLevel) ? params.level as BankLevel : 'N3';
  const requestedBatch = Number(params.batch);
  const initialBatch = Number.isInteger(requestedBatch) && requestedBatch >= 0 && requestedBatch < batchCount(initialLevel) ? requestedBatch : 0;
  const [level, setLevel] = useState<BankLevel>(initialLevel);
  const [batch, setBatch] = useState(initialBatch);
  const [stage, setStage] = useState<Stage>('learn');
  const [mode, setMode] = useState<QuizMode>('meaning');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<N3Results>({});
  const [saveError, setSaveError] = useState(false);
  const words = useMemo(() => wordsForBatch(level, batch), [level, batch]);
  const questions = useMemo(() => questionsForBatch(level, batch, mode), [level, batch, mode]);
  const question = questions[index];
  const count = batchCount(level);
  const completed = Array.from({ length: count }, (_, item) => resultKey(level, item, mode)).filter((key) => results[key]).length;
  const firstIncomplete = Array.from({ length: count }, (_, item) => item).find((item) =>
    (mode === 'meaning' || wordsForBatch(level, item).some((word) => /[\u3400-\u9fff]/u.test(word.word)))
    && !results[resultKey(level, item, mode)]);

  useEffect(() => { getN3Results().then(setResults).catch(() => setSaveError(true)); }, []);

  function chooseLevel(next: BankLevel) {
    setLevel(next);
    setBatch(0);
    setStage('learn');
    setIndex(0);
    setSelected(null);
  }

  function chooseMode(next: QuizMode) {
    setMode(next);
    setStage('learn');
    setIndex(0);
    setSelected(null);
    setCorrect(0);
  }

  function chooseBatch(next: number) {
    if (next < 0 || next >= batchCount(level)) return;
    setBatch(next);
    setStage('learn');
    setIndex(0);
    setSelected(null);
    setCorrect(0);
  }

  async function advance() {
    if (!question || selected === null) return;
    const nextCorrect = correct + Number(selected === question.answer);
    setCorrect(nextCorrect);
    setSelected(null);
    if (index + 1 < questions.length) { setIndex(index + 1); return; }
    setStage('result');
    try { setResults(await saveN3Result(resultKey(level, batch, mode), nextCorrect, questions.length)); }
    catch { setSaveError(true); }
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><HeaderBackButton onPress={() => stage === 'learn' ? router.back() : setStage('learn')} /><Text style={s.headerTitle}>문자·어휘 전체 학습</Text><View style={s.back} /></View>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        <View style={s.hero}><Text style={s.eyebrow}>N3 대비 어휘 자료</Text><Text style={s.heroTitle}>{bankCounts.total.toLocaleString()}개 중복 없는 어휘</Text><Text style={s.body}>N3 {bankCounts.N3.toLocaleString()}개 · 선행 N4·N5 {(bankCounts.N4 + bankCounts.N5).toLocaleString()}개를 20개씩 공부합니다. 표제어와 읽기가 모두 같은 항목은 하나로 합쳤습니다.</Text><Text style={s.note}>어휘 뜻은 전체 항목을 대조·수정했습니다. 한국어 번역을 검수하지 않은 예문은 일본어 원문만 표시합니다.</Text></View>
        <View style={s.levels}>{levels.map((item) => <Pressable key={item} onPress={() => chooseLevel(item)} style={[s.levelButton, level === item && s.levelActive]} accessibilityRole="button"><Text style={[s.levelText, level === item && s.levelTextActive]}>{item} · {bankByLevel[item].length.toLocaleString()}</Text></Pressable>)}</View>
        <View style={s.levels}>{quizModes.map((item) => <Pressable key={item.id} onPress={() => chooseMode(item.id)} style={[s.levelButton, mode === item.id && s.levelActive]} accessibilityRole="button"><Text style={[s.levelText, mode === item.id && s.levelTextActive]}>{item.label}</Text></Pressable>)}</View>
        <Pressable onPress={() => router.push({ pathname: '/n3-study', params: { area: 'vocabulary' } })} style={s.jumpButton} accessibilityRole="button"><Text style={s.jumpText}>문맥·유의 표현·용법 문제 풀기 ›</Text></Pressable>
        <View style={s.batchRow}><Pressable onPress={() => chooseBatch(batch - 1)} disabled={batch === 0} style={s.batchButton} accessibilityRole="button"><Text style={s.batchButtonText}>‹ 이전</Text></Pressable><View style={s.batchCenter}><Text style={s.batchTitle}>{batch + 1} / {count} 묶음</Text><Text style={s.batchSub}>완료 {completed}묶음 · {batch * 20 + 1}–{Math.min((batch + 1) * 20, bankByLevel[level].length)}번</Text></View><Pressable onPress={() => chooseBatch(batch + 1)} disabled={batch + 1 >= count} style={s.batchButton} accessibilityRole="button"><Text style={s.batchButtonText}>다음 ›</Text></Pressable></View>
        {firstIncomplete !== undefined && firstIncomplete !== batch ? <Pressable onPress={() => chooseBatch(firstIncomplete)} style={s.jumpButton} accessibilityRole="button"><Text style={s.jumpText}>이어서 학습 · {firstIncomplete + 1}묶음으로 이동</Text></Pressable> : null}
        {stage === 'learn' ? <>
          <Text style={s.sectionTitle}>어휘 살펴보기</Text><Text style={s.note}>읽기를 누르면 일본어 음성이 나오고 한글 발음 표기가 펼쳐집니다. 한자를 누르면 뜻과 음을 볼 수 있습니다. 한글 발음은 학습을 돕는 근사 표기입니다.</Text>
          {words.map((word, item) => <View key={word.id} style={s.wordCard}><Text style={s.wordIndex}>{batch * 20 + item + 1}</Text><View style={s.wordContent}><InteractiveJapaneseWord word={word.word} reading={word.reading} /><Text style={s.meaning}>{word.meaningKo}</Text>{word.curatedExample ? <Text style={s.example}>{word.curatedExample}{word.curatedTranslation ? `\n${word.curatedTranslation}` : ''}</Text> : word.examples[0] ? <Text style={s.example}>{word.examples[0].ja}{word.examples[0].reviewed ? `\n${word.examples[0].ko}` : ''}</Text> : null}</View></View>)}
        </> : null}
        {stage === 'quiz' && question ? <>
          <Text style={s.sectionTitle}>{quizModes.find((item) => item.id === mode)?.label} 확인 · {index + 1}/{questions.length}</Text>
          <View style={s.questionCard}><Text style={s.questionLabel}>{mode === 'meaning' ? '한국어 뜻' : mode === 'reading' ? '한자 읽기' : '올바른 표기'}</Text><Text style={s.questionWord}>{question.prompt}</Text><Text style={s.body}>{mode === 'meaning' ? '이 단어의 뜻을 고르세요.' : mode === 'reading' ? `${question.word.meaningKo} · 읽기를 고르세요.` : `${question.word.meaningKo} · 표기를 고르세요.`}</Text></View>
          {question.choices.map((choice) => <Pressable key={choice} onPress={() => setSelected(choice)} disabled={selected !== null} style={[s.choice, selected !== null && choice === question.answer && s.correct, selected === choice && choice !== question.answer && s.wrong]} accessibilityRole="button"><Text style={s.choiceText}>{choice}</Text></Pressable>)}
          {selected !== null ? <View style={s.feedback}><Text style={s.feedbackTitle}>{selected === question.answer ? '정답입니다' : `정답: ${question.answer}`}</Text><Text style={s.body}>{question.word.word} · {question.word.reading}</Text>{question.word.curatedExample ? <Text style={s.example}>{question.word.curatedExample}{question.word.curatedTranslation ? `\n${question.word.curatedTranslation}` : ''}</Text> : question.word.examples[0] ? <Text style={s.example}>{question.word.examples[0].ja}{question.word.examples[0].reviewed ? `\n${question.word.examples[0].ko}` : ''}</Text> : null}</View> : null}
        </> : null}
        {stage === 'result' ? <View style={s.result}><Text style={s.heroTitle}>학습 완료</Text><Text style={s.score}>{correct} / {questions.length} 정답</Text><Text style={s.body}>최고 점수가 기기에 저장됩니다. 다음 묶음으로 이어서 공부할 수 있습니다.</Text></View> : null}
        {saveError ? <Text style={s.error}>학습 기록을 저장하거나 불러오지 못했습니다.</Text> : null}
      </View>
    </ScrollView>
    <View style={s.footer}>{stage === 'learn' ? <Pressable onPress={() => { setIndex(0); setCorrect(0); setSelected(null); setStage('quiz'); }} disabled={questions.length === 0} style={[s.primary, questions.length === 0 && { opacity: 0.4 }]} accessibilityRole="button"><Text style={s.primaryText}>{questions.length ? `${questions.length}문제 풀기` : '이 묶음에는 한자 어휘가 없습니다'}</Text></Pressable> : stage === 'quiz' && selected !== null ? <Pressable onPress={advance} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>{index + 1 === questions.length ? '결과 보기' : '다음 문제'}</Text></Pressable> : stage === 'result' ? <Pressable onPress={() => chooseBatch(batch + 1 < count ? batch + 1 : batch)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>{batch + 1 < count ? '다음 묶음 학습' : '다시 학습'}</Text></Pressable> : null}</View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7FB' }, header: { height: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECE9F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }, back: { width: 40 }, headerTitle: { color: ink, fontFamily: 'NotoSansKR_700Bold', fontSize: 16 }, scroll: { paddingBottom: 24 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 18 }, hero: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#F4D9E0', padding: 20 }, eyebrow: { color: pink, fontFamily: 'NotoSansKR_700Bold', fontSize: 11 }, heroTitle: { color: ink, fontFamily: 'NotoSansKR_700Bold', fontSize: 20, marginTop: 6 }, body: { color: muted, fontFamily: 'NotoSansKR_400Regular', fontSize: 12, lineHeight: 20, marginTop: 8 }, note: { color: muted, fontFamily: 'NotoSansKR_400Regular', fontSize: 11, lineHeight: 18, marginTop: 8 }, levels: { flexDirection: 'row', gap: 8, marginTop: 16 }, levelButton: { flex: 1, backgroundColor: '#fff', borderColor: '#ECE9F0', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }, levelActive: { borderColor: pink, backgroundColor: '#FFF0F4' }, levelText: { color: muted, fontFamily: 'NotoSansKR_600SemiBold', fontSize: 12 }, levelTextActive: { color: pink }, batchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17, backgroundColor: '#fff', borderRadius: 14, padding: 10 }, batchButton: { padding: 8 }, batchButtonText: { color: pink, fontFamily: 'NotoSansKR_700Bold', fontSize: 12 }, batchCenter: { alignItems: 'center' }, batchTitle: { color: ink, fontFamily: 'NotoSansKR_700Bold', fontSize: 14 }, batchSub: { color: muted, fontFamily: 'NotoSansKR_400Regular', fontSize: 10, marginTop: 3 }, jumpButton: { alignSelf: 'flex-end', paddingVertical: 9, paddingHorizontal: 5 }, jumpText: { color: pink, fontFamily: 'NotoSansKR_600SemiBold', fontSize: 12 }, sectionTitle: { color: ink, fontFamily: 'NotoSansKR_700Bold', fontSize: 17, marginTop: 23, marginBottom: 12 }, wordCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 9, borderWidth: 1, borderColor: '#ECE9F0' }, wordIndex: { color: pink, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, width: 25 }, wordContent: { flex: 1 }, word: { color: ink, fontFamily: 'NotoSansJP_700Bold', fontSize: 21 }, reading: { color: pink, fontFamily: 'NotoSansJP_400Regular', fontSize: 13, marginTop: 2 }, meaning: { color: ink, fontFamily: 'NotoSansKR_600SemiBold', fontSize: 14, marginTop: 7 }, secondaryMeaning: { color: muted, fontFamily: 'NotoSansKR_400Regular', fontSize: 11, marginTop: 4 }, example: { color: muted, fontFamily: 'NotoSansJP_400Regular', fontSize: 12, lineHeight: 21, marginTop: 9 }, questionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 22, marginBottom: 14 }, questionLabel: { color: pink, fontFamily: 'NotoSansKR_700Bold', fontSize: 11 }, questionWord: { color: ink, fontFamily: 'NotoSansJP_700Bold', fontSize: 32, marginTop: 12 }, choice: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECE9F0', borderRadius: 11, padding: 15, marginBottom: 9 }, choiceText: { color: ink, fontFamily: 'NotoSansKR_500Medium', fontSize: 13, lineHeight: 20 }, correct: { borderColor: '#087F5B', backgroundColor: '#E5F8EF' }, wrong: { borderColor: pink, backgroundColor: '#FFF0F4' }, feedback: { backgroundColor: '#fff', borderRadius: 14, padding: 17, marginTop: 8 }, feedbackTitle: { color: ink, fontFamily: 'NotoSansKR_700Bold', fontSize: 14 }, result: { backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', padding: 28, marginTop: 24 }, score: { color: pink, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 25, marginTop: 10 }, error: { color: pink, fontSize: 12, marginTop: 12 }, footer: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#ECE9F0' }, primary: { width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: pink, borderRadius: 11, height: 49, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: '#fff', fontFamily: 'NotoSansKR_700Bold', fontSize: 14 },
});
