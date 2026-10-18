import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import type { ChoiceQuestion } from '@/content/n3';
import { n3FullMocks } from '@/content/n3-full-mock';
import { questionChoices } from '@/content/question-choices';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';
import { playListeningTranscript, stopListeningPlayback } from '@/utils/listening-playback';

type Phase = 'select' | 'vocabulary' | 'knowledge' | 'listening' | 'result';
type Item = { id: string; question: ChoiceQuestion; passage?: string; transcript?: string };
type Answers = Record<'vocabulary' | 'knowledge' | 'listening', (string | null)[]>;

const phaseLabels = { vocabulary: '문자·어휘', knowledge: '문법·독해', listening: '청해' };
const phaseMinutes = { vocabulary: 30, knowledge: 70, listening: 40 };
const nextPhase = (phase: Phase): Phase => phase === 'vocabulary' ? 'knowledge' : phase === 'knowledge' ? 'listening' : 'result';
const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const emptyAnswers = (index: number): Answers => ({
  vocabulary: Array(n3FullMocks[index].vocabulary.length).fill(null),
  knowledge: Array(n3FullMocks[index].grammar.length + n3FullMocks[index].reading.reduce((count, passage) => count + (passage.questions?.length ?? 0), 0)).fill(null),
  listening: Array(n3FullMocks[index].listening.length).fill(null),
});

export default function N3FullMockScreen() {
  const scroll = useRef<ScrollView>(null);
  const deadlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mockIndex, setMockIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('select');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(0));
  const [played, setPlayed] = useState<Record<string, boolean>>({});
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [best, setBest] = useState<N3Results>({});
  const [audioError, setAudioError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const mock = mockIndex === null ? null : n3FullMocks[mockIndex];
  const items = useMemo<Record<keyof Answers, Item[]>>(() => {
    if (!mock) return { vocabulary: [], knowledge: [], listening: [] } as Record<keyof Answers, Item[]>;
    return {
      vocabulary: mock.vocabulary.map((question, questionIndex) => ({ id: `v-${questionIndex}`, question })),
      knowledge: [
        ...mock.grammar.map((question, questionIndex) => ({ id: `g-${questionIndex}`, question })),
        ...mock.reading.flatMap((passage) => (passage.questions ?? []).map((question, questionIndex) => ({ id: `${passage.id}-${questionIndex}`, question, passage: passage.passage }))),
      ],
      listening: mock.listening.map((item) => ({ id: item.id, question: item.question, transcript: item.transcript })),
    };
  }, [mock]);
  const activePhase = phase === 'vocabulary' || phase === 'knowledge' || phase === 'listening' ? phase : null;
  const current = activePhase ? items[activePhase][index] : null;
  const currentAnswers = activePhase ? answers[activePhase] : [];
  const answered = currentAnswers.filter((answer) => answer !== null).length;
  const score = (section: keyof Answers) => items[section].reduce((total, item, questionIndex) => total + Number(answers[section][questionIndex] === item.question.answer), 0);
  const grammarScore = mock ? items.knowledge.slice(0, mock.grammar.length).reduce((total, item, itemIndex) => total + Number(answers.knowledge[itemIndex] === item.question.answer), 0) : 0;
  const readingScore = mock ? items.knowledge.slice(mock.grammar.length).reduce((total, item, itemIndex) => total + Number(answers.knowledge[mock.grammar.length + itemIndex] === item.question.answer), 0) : 0;
  const totalScore = score('vocabulary') + score('knowledge') + score('listening');
  const totalQuestions = items.vocabulary.length + items.knowledge.length + items.listening.length;
  const practiceTargetMet = !!mock?.diagnostic && (score('vocabulary') + grammarScore) >= 47 && readingScore >= 13 && score('listening') >= 23;
  const weakAreas = mock ? [
    { area: 'vocabulary', label: '어휘', correct: score('vocabulary'), total: mock.vocabulary.length },
    { area: 'grammar', label: '문법', correct: grammarScore, total: mock.grammar.length },
    { area: 'reading', label: '독해', correct: readingScore, total: items.knowledge.length - mock.grammar.length },
    { area: 'listening', label: '청해', correct: score('listening'), total: mock.listening.length },
  ].filter((item) => item.correct < item.total * 0.8) : [];

  useEffect(() => { getN3Results().then(setBest).catch(() => setSaveError(true)); }, []);
  useEffect(() => () => {
    if (deadlineTimer.current) clearTimeout(deadlineTimer.current);
    void stopListeningPlayback();
  }, []);
  useEffect(() => {
    if (!activePhase || !deadline) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        void stopListeningPlayback();
        const upcoming = nextPhase(activePhase);
        const duration = upcoming === 'knowledge' || upcoming === 'listening' ? phaseMinutes[upcoming] * 60 : 0;
        setDeadline(duration ? Date.now() + duration * 1000 : 0);
        setRemaining(duration);
        setIndex(0);
        setPhase(upcoming);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activePhase, deadline]);
  useEffect(() => {
    if (phase !== 'result' || !mock) return;
    saveN3Result(mock.id, totalScore, totalQuestions).then(setBest).catch(() => setSaveError(true));
    // 점수는 결과 화면에 도달할 때 한 번만 저장한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mock]);

  function scheduleDeadline(seconds: number) {
    if (deadlineTimer.current) clearTimeout(deadlineTimer.current);
    setDeadline(0);
    if (seconds) {
      deadlineTimer.current = setTimeout(() => {
        setDeadline(Date.now() + seconds * 1000);
        deadlineTimer.current = null;
      }, 0);
    }
    setRemaining(seconds);
  }

  function start(mockNumber: number) {
    void stopListeningPlayback();
    setMockIndex(mockNumber);
    setAnswers(emptyAnswers(mockNumber));
    setPlayed({});
    setIndex(0);
    scheduleDeadline(phaseMinutes.vocabulary * 60);
    setAudioError(false);
    setSaveError(false);
    setPhase('vocabulary');
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function move(questionIndex: number) {
    void stopListeningPlayback();
    setAudioError(false);
    setIndex(questionIndex);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }

  function finishSection() {
    if (!activePhase) return;
    void stopListeningPlayback();
    const upcoming = nextPhase(activePhase);
    const duration = upcoming === 'knowledge' || upcoming === 'listening' ? phaseMinutes[upcoming] * 60 : 0;
    scheduleDeadline(duration);
    setIndex(0);
    setAudioError(false);
    setPhase(upcoming);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function play() {
    if (!current?.transcript || played[current.id]) return;
    const itemId = current.id;
    setAudioError(false);
    setPlayed((previous) => ({ ...previous, [itemId]: true }));
    void playListeningTranscript(current.transcript, () => {
      setAudioError(true);
      setPlayed((previous) => ({ ...previous, [itemId]: false }));
    }).catch(() => {
      setAudioError(true);
      setPlayed((previous) => ({ ...previous, [itemId]: false }));
    });
  }

  function leave() {
    void stopListeningPlayback();
    if (deadlineTimer.current) clearTimeout(deadlineTimer.current);
    deadlineTimer.current = null;
    if (phase === 'select') router.back();
    else { setPhase('select'); setMockIndex(null); setDeadline(0); }
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><HeaderBackButton onPress={leave} /><Text style={s.headerTitle}>N3 종합 모의고사</Text><View style={s.headerSpacer} /></View>
    <ScrollView ref={scroll} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {phase === 'select' ? <>
          <View style={s.hero}><Text style={s.eyebrow}>시험 순서대로 한 번에 연습</Text><Text style={s.title}>종합 모의고사</Text><Text style={s.body}>문자·어휘 35문항 30분 → 문법 23문항·독해 16문항 70분 → 청해 28문항 40분입니다. 각 구간이 끝나면 이전 구간으로 돌아갈 수 없습니다.</Text><Text style={s.note}>1·2회는 기존 영역별 문제를 포함한 복습용입니다. 실력 점검에는 처음 보는 상태에서 실전 진단 회차를 풀어 보세요. 청해는 기기 음성 합성이고 정답 수는 실제 JLPT 환산 점수가 아닙니다.</Text></View>
          {n3FullMocks.map((item, mockNumber) => <Pressable key={item.id} onPress={() => start(mockNumber)} style={s.card} accessibilityRole="button" accessibilityLabel={`${item.title} 시작`}><Text style={s.cardTitle}>{item.title} ›</Text><Text style={s.body}>총 102문항 · 140분 · 영역별 제한 시간{item.diagnostic ? ' · 기존 모의고사와 겹치지 않는 새 문제' : ''}</Text>{best[item.id] ? <Text style={s.best}>기록한 최고 정답 수 {best[item.id].score}/{best[item.id].total}</Text> : null}</Pressable>)}
        </> : phase === 'result' && mock ? <>
          <View style={s.hero}><Text style={s.eyebrow}>{mock.title} · 결과</Text><Text style={s.title}>{totalScore} / {totalQuestions}문항 정답</Text><Text style={s.body}>문자·어휘 {score('vocabulary')}/{items.vocabulary.length} · 문법 {grammarScore}/{mock.grammar.length} · 독해 {readingScore}/{items.knowledge.length - mock.grammar.length} · 청해 {score('listening')}/{items.listening.length}</Text>{mock.diagnostic ? <Text style={s.best}>{practiceTargetMet ? '자체 연습 목표 달성' : '자체 연습 목표까지 복습 필요'} · 언어지식 47/58, 독해 13/16, 청해 23/28 이상</Text> : null}<Text style={s.note}>위 목표는 앱의 복습 기준입니다. 정답 개수는 JLPT 척도 점수로 환산할 수 없습니다. 각 영역의 오답 원인을 확인하세요.</Text></View>
          {weakAreas.length ? <View style={s.card}><Text style={s.cardTitle}>다음 학습</Text><Text style={s.body}>정답률 80% 미만인 영역의 단원과 영역별 모의고사를 다시 풀어 보세요.</Text>{weakAreas.map((item) => <Pressable key={item.area} onPress={() => router.push({ pathname: '/n3-study', params: { area: item.area } })} style={s.reviewLink} accessibilityRole="button"><Text style={s.secondaryText}>{item.label} {item.correct}/{item.total} · 학습 단원 보기 ›</Text></Pressable>)}</View> : null}
          {(['vocabulary', 'knowledge', 'listening'] as const).map((section) => <View key={section} style={s.reviewSection}><Text style={s.sectionTitle}>{phaseLabels[section]} · 오답과 미응답</Text>{items[section].map((item, itemIndex) => answers[section][itemIndex] === item.question.answer ? null : <View key={item.id} style={s.review}><Text style={s.eyebrow}>{itemIndex + 1}. {item.question.kind ?? phaseLabels[section]}</Text>{item.passage ? <Text style={s.passage}>{item.passage}</Text> : null}{item.transcript ? <Text style={s.passage}>{item.transcript}</Text> : null}<Text style={s.prompt}>{item.question.prompt}</Text><Text style={s.answer}>내 답: {answers[section][itemIndex] ?? '미응답'} · 정답: {item.question.answer}</Text><Text style={s.body}>{item.question.explanation}</Text></View>)}</View>)}
          <Pressable onPress={() => start(mockIndex!)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>다시 풀기</Text></Pressable>
          <Pressable onPress={leave} style={s.secondary} accessibilityRole="button"><Text style={s.secondaryText}>다른 회차 보기</Text></Pressable>
        </> : activePhase && current ? <>
          <View style={s.progress}><Text style={s.eyebrow}>{mock?.title} · {phaseLabels[activePhase]} {index + 1}/{items[activePhase].length}</Text><Text style={s.timer}>{clock(remaining)}</Text></View>
          <View style={s.track}><View style={[s.trackFill, { width: `${((index + 1) / items[activePhase].length) * 100}%` }]} /></View>
          {current.passage ? <View style={s.card}><Text style={s.eyebrow}>지문</Text><Text style={s.passage}>{current.passage}</Text></View> : null}
          {current.transcript ? <View style={s.card}><Text style={s.eyebrow}>청해 · 한 번 듣기</Text><Text style={s.body}>음성은 한 번만 재생됩니다. 문제가 있으면 재생 버튼을 다시 누를 수 있습니다.</Text><Pressable onPress={play} disabled={!!played[current.id]} style={[s.audioButton, played[current.id] && s.disabled]} accessibilityRole="button"><Text style={s.audioButtonText}>{played[current.id] ? '재생 완료' : '▶ 일본어 듣기'}</Text></Pressable>{audioError ? <Text style={s.note}>음성 재생에 실패했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}</View> : null}
          <View style={s.card}><Text style={s.eyebrow}>{current.question.kind ?? phaseLabels[activePhase]}</Text><Text style={s.prompt}>{current.question.prompt}</Text></View>
          {questionChoices(current.question).map((choice) => <Pressable key={choice} onPress={() => setAnswers((previous) => ({ ...previous, [activePhase]: previous[activePhase].map((answer, answerIndex) => answerIndex === index ? choice : answer) }))} style={[s.choice, currentAnswers[index] === choice && s.choiceSelected]} accessibilityRole="button" accessibilityState={{ selected: currentAnswers[index] === choice }}><Text style={s.choiceText}>{choice}</Text></Pressable>)}
          <Text style={s.answered}>답한 문제 {answered}/{items[activePhase].length}</Text>
          <View style={s.navigation}><Pressable onPress={() => move(Math.max(0, index - 1))} disabled={index === 0} style={[s.navButton, index === 0 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>이전</Text></Pressable><Pressable onPress={() => move(Math.min(items[activePhase].length - 1, index + 1))} disabled={index === items[activePhase].length - 1} style={[s.navButton, index === items[activePhase].length - 1 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>다음</Text></Pressable></View>
          <Pressable onPress={finishSection} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>{activePhase === 'listening' ? '제출하고 결과 보기' : '이 영역 제출하고 다음으로'}</Text></Pressable>
        </> : null}
        {saveError ? <Text style={s.note}>학습 기록을 저장하거나 불러오지 못했습니다. 저장 공간을 확인해 주세요.</Text> : null}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7FB' }, header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ECE9F0' }, headerTitle: { fontFamily: 'NotoSansKR_700Bold', fontSize: 16, color: '#201F24' }, headerSpacer: { width: 40 }, scroll: { flexGrow: 1, paddingBottom: 32 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 },
  hero: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 18, padding: 20, marginBottom: 14 }, eyebrow: { color: '#E82E5A', fontFamily: 'NotoSansKR_700Bold', fontSize: 11 }, title: { color: '#201F24', fontFamily: 'NotoSansKR_700Bold', fontSize: 21, marginTop: 8 }, body: { color: '#706D77', fontFamily: 'NotoSansKR_400Regular', fontSize: 12, lineHeight: 20, marginTop: 8 }, note: { color: '#A4445C', fontFamily: 'NotoSansKR_500Medium', fontSize: 11, lineHeight: 18, marginTop: 12 }, card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECE9F0', borderRadius: 14, padding: 17, marginBottom: 12 }, cardTitle: { color: '#201F24', fontFamily: 'NotoSansKR_700Bold', fontSize: 15 }, best: { color: '#087F5B', fontFamily: 'NotoSansKR_600SemiBold', fontSize: 12, marginTop: 9 },
  progress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, timer: { color: '#201F24', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }, track: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden', marginVertical: 17 }, trackFill: { height: 6, backgroundColor: '#E82E5A' }, passage: { color: '#201F24', fontFamily: 'NotoSansJP_400Regular', fontSize: 14, lineHeight: 27, marginTop: 10 }, prompt: { color: '#201F24', fontFamily: 'NotoSansJP_400Regular', fontSize: 16, lineHeight: 27, marginTop: 8 }, choice: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECE9F0', borderRadius: 11, minHeight: 52, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 10, marginBottom: 9 }, choiceSelected: { borderColor: '#E82E5A', backgroundColor: '#FFF0F4' }, choiceText: { color: '#201F24', fontFamily: 'NotoSansJP_400Regular', fontSize: 14, lineHeight: 23 }, answered: { color: '#797681', fontFamily: 'NotoSansKR_400Regular', fontSize: 11, marginTop: 7 }, navigation: { flexDirection: 'row', gap: 10, marginTop: 18 }, navButton: { flex: 1, alignItems: 'center', paddingVertical: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E82E5A', borderRadius: 10 }, disabled: { opacity: 0.45 }, primary: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E82E5A', borderRadius: 11, minHeight: 48, marginTop: 15 }, primaryText: { color: '#fff', fontFamily: 'NotoSansKR_700Bold', fontSize: 13 }, secondary: { alignItems: 'center', paddingVertical: 14 }, secondaryText: { color: '#E82E5A', fontFamily: 'NotoSansKR_700Bold', fontSize: 13 }, reviewLink: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#ECE9F0' }, audioButton: { backgroundColor: '#FFF0F4', borderRadius: 10, alignItems: 'center', padding: 13, marginTop: 12 }, audioButtonText: { color: '#E82E5A', fontFamily: 'NotoSansKR_700Bold', fontSize: 13 }, sectionTitle: { color: '#201F24', fontFamily: 'NotoSansKR_700Bold', fontSize: 16, marginBottom: 10 }, reviewSection: { marginTop: 10 }, review: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ECE9F0', borderRadius: 12, padding: 15, marginBottom: 10 }, answer: { color: '#087F5B', fontFamily: 'NotoSansKR_600SemiBold', fontSize: 12, marginTop: 8 },
});
