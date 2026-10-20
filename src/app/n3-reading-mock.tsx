import { Link, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import { n3ReadingMocks } from '@/content/n3-reading-mock';
import { questionChoices } from '@/content/question-choices';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';
import { reviewQuestion, saveQuestionAttempts } from '@/storage/wrong-questions';

const officialUrl = 'https://www.jlpt.jp/e/samples/sampleindex.html';
const colors = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', line: '#ECE9F0' };
const fonts = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular', number: 'PlusJakartaSans_700Bold' };

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function N3ReadingMockScreen() {
  const scroll = useRef<ScrollView>(null);
  const [mockIndex, setMockIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [best, setBest] = useState<N3Results>({});
  const [saveError, setSaveError] = useState(false);

  const mock = mockIndex === null ? null : n3ReadingMocks[mockIndex];
  const items = useMemo(() => mock?.passages.flatMap((passage) =>
    (passage.questions ?? []).map((question) => ({ passage, question }))) ?? [], [mock]);
  const current = items[questionIndex];
  const answered = answers.filter((answer) => answer !== null).length;
  const score = items.reduce((total, item, index) => total + Number(answers[index] === item.question.answer), 0);

  useEffect(() => { getN3Results().then(setBest).catch(() => setSaveError(true)); }, []);
  useEffect(() => {
    if (!mock || submitted || deadline !== 0) return;
    const timeout = setTimeout(() => setDeadline(Date.now() + mock.minutes * 60_000), 0);
    return () => clearTimeout(timeout);
  }, [deadline, mock, submitted]);
  useEffect(() => {
    if (!mock || submitted || deadline === 0) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) setSubmitted(true);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline, mock, submitted]);
  useEffect(() => {
    if (!mock || !submitted) return;
    saveN3Result(mock.id, score, items.length).then(setBest).catch(() => setSaveError(true));
    saveQuestionAttempts(items.flatMap((item, index) => answers[index] === null ? [] : [{
      question: reviewQuestion(`${mock.id}:${index}`, 'reading', mock.title, item.question, { passage: item.passage.passage }),
      selected: answers[index]!,
    }])).catch(() => setSaveError(true));
  }, [answers, items, mock, score, submitted]);

  function start(index: number) {
    const next = n3ReadingMocks[index];
    setMockIndex(index);
    setQuestionIndex(0);
    setAnswers(Array(next.passages.reduce((total, passage) => total + (passage.questions?.length ?? 0), 0)).fill(null));
    setRemaining(next.minutes * 60);
    setDeadline(0);
    setSubmitted(false);
    setSaveError(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function navigate(index: number) {
    setQuestionIndex(index);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }

  function back() {
    if (mockIndex === null) router.back();
    else setMockIndex(null);
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><HeaderBackButton onPress={back} /><Text style={s.headerTitle}>N3 독해 실전 연습</Text><View style={s.headerSpacer} /></View>
    <ScrollView ref={scroll} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {!mock ? <>
          <View style={s.hero}><Text style={s.eyebrow}>시간제한 독해 연습</Text><Text style={s.title}>독해 모의고사</Text><Text style={s.body}>회차마다 처음 보는 짧은 글·중간 길이 글·긴 글·정보 검색 지문을 풉니다. 정답과 한국어 해설은 제출하거나 시간이 끝난 뒤 확인할 수 있습니다.</Text><Text style={s.notice}>앱의 독해 단독 연습 시간입니다. 실제 N3의 문법·독해 통합 시험과 동일한 시간이나 점수 환산은 아닙니다.</Text></View>
          {n3ReadingMocks.map((item, index) => <Pressable key={item.id} onPress={() => start(index)} style={s.card} accessibilityRole="button" accessibilityLabel={`${item.title} 시작`}><Text style={s.cardTitle}>{item.title} ›</Text><Text style={s.body}>{item.passages.length}지문 · {item.passages.reduce((total, passage) => total + (passage.questions?.length ?? 0), 0)}문항 · {item.minutes}분</Text>{best[item.id] ? <Text style={s.best}>최고 {best[item.id].score}/{best[item.id].total}점</Text> : null}</Pressable>)}
          <View style={s.card}><Text style={s.cardTitle}>JLPT 공식 예제·문제집</Text><Text style={s.body}>공식 사이트에서 N3 독해의 형식과 난도를 확인할 수 있습니다. 인터넷 연결이 필요합니다.</Text><Link href={officialUrl} target="_blank" style={s.officialLink}>JLPT 공식 자료 열기 ↗</Link></View>
        </> : submitted ? <>
          <View style={s.hero}><Text style={s.eyebrow}>{mock.title} · 결과</Text><Text style={s.title}>{score} / {items.length} 정답</Text><Text style={s.body}>미응답 {items.length - answered}문항 · 지문과 해설을 아래에서 다시 확인하세요.</Text><Text style={s.notice}>이 점수는 독해 단독 연습 결과이며 JLPT 합격 점수로 환산되지 않습니다.</Text></View>
          {items.map((item, index) => <View key={`${item.passage.id}-${index}`} style={s.card}><Text style={s.eyebrow}>{index + 1}. {item.question.kind} · {answers[index] === item.question.answer ? '정답' : '오답'}</Text><Text style={s.passage}>{item.passage.passage}</Text><Text style={s.prompt}>{item.question.prompt}</Text><Text style={s.answer}>내 답: {answers[index] ?? '미응답'} · 정답: {item.question.answer}</Text><Text style={s.body}>{item.question.explanation}</Text></View>)}
          <Pressable onPress={() => start(mockIndex!)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>다시 풀기</Text></Pressable>
          <Pressable onPress={() => setMockIndex(null)} style={s.secondary} accessibilityRole="button"><Text style={s.secondaryText}>다른 회차 보기</Text></Pressable>
        </> : current ? <>
          <View style={s.progress}><Text style={s.eyebrow}>{mock.title} · {questionIndex + 1}/{items.length}</Text><Text style={s.timer}>남은 시간 {clock(remaining)}</Text></View>
          <View style={s.track}><View style={[s.trackFill, { width: `${((questionIndex + 1) / items.length) * 100}%` }]} /></View>
          <View style={s.card}><Text style={s.eyebrow}>{current.question.kind} · {current.passage.title}</Text><Text style={s.passage}>{current.passage.passage}</Text></View>
          <View style={s.card}><Text style={s.prompt}>{current.question.prompt}</Text></View>
          {questionChoices(current.question).map((choice) => <Pressable key={choice} onPress={() => setAnswers((previous) => previous.map((answer, index) => index === questionIndex ? choice : answer))} style={[s.choice, answers[questionIndex] === choice && s.choiceSelected]} accessibilityRole="button" accessibilityState={{ selected: answers[questionIndex] === choice }}><Text style={s.choiceText}>{choice}</Text></Pressable>)}
          <Text style={s.answered}>답한 문제 {answered}/{items.length} · 제출 전까지 정답은 표시하지 않습니다.</Text>
          <View style={s.navigation}><Pressable onPress={() => navigate(Math.max(0, questionIndex - 1))} disabled={questionIndex === 0} style={[s.navButton, questionIndex === 0 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>이전</Text></Pressable><Pressable onPress={() => navigate(Math.min(items.length - 1, questionIndex + 1))} disabled={questionIndex === items.length - 1} style={[s.navButton, questionIndex === items.length - 1 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>다음</Text></Pressable></View>
          <Pressable onPress={() => setSubmitted(true)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>제출하고 채점하기</Text></Pressable>
        </> : null}
        {saveError ? <Text style={s.notice}>최고 점수를 저장하거나 불러오지 못했습니다. 저장 공간을 확인해 주세요.</Text> : null}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, scroll: { flexGrow: 1, paddingBottom: 32 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }, headerTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 }, headerSpacer: { width: 40 },
  hero: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 19, padding: 20, marginBottom: 14 }, eyebrow: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, title: { color: colors.ink, fontFamily: fonts.bold, fontSize: 21, marginTop: 8 }, body: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 8 }, notice: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, lineHeight: 18, marginTop: 12 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 17, marginBottom: 12 }, cardTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 }, best: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 9 }, officialLink: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13, marginTop: 13 },
  progress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, timer: { color: colors.ink, fontFamily: fonts.number, fontSize: 14 }, track: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden', marginVertical: 17 }, trackFill: { height: 6, backgroundColor: colors.pink },
  passage: { color: colors.ink, fontFamily: fonts.jp, fontSize: 15, lineHeight: 27, marginTop: 10 }, prompt: { color: colors.ink, fontFamily: fonts.jp, fontSize: 16, lineHeight: 27, marginTop: 5 }, choice: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, minHeight: 52, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 10, marginBottom: 9 }, choiceSelected: { borderColor: colors.pink, backgroundColor: colors.pale }, choiceText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 14, lineHeight: 23 }, answered: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 7 }, answer: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 9 },
  navigation: { flexDirection: 'row', gap: 10, marginTop: 18 }, navButton: { flex: 1, alignItems: 'center', paddingVertical: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.pink, borderRadius: 10 }, disabled: { opacity: 0.35 }, primary: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pink, borderRadius: 11, minHeight: 48, marginTop: 15 }, primaryText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 }, secondary: { alignItems: 'center', paddingVertical: 14 }, secondaryText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13 },
});
