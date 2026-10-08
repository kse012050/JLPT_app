import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import { n3GrammarMocks } from '@/content/n3-grammar-mock';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';

const officialUrl = 'https://www.jlpt.jp/e/samples/sampleindex.html';
const colors = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', greenPale: '#E5F8EF', line: '#ECE9F0' };
const fonts = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular', number: 'PlusJakartaSans_700Bold' };

function clock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function N3GrammarMockScreen() {
  const [mockIndex, setMockIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [best, setBest] = useState<N3Results>({});
  const [saveError, setSaveError] = useState(false);

  const mock = mockIndex === null ? null : n3GrammarMocks[mockIndex];
  const question = mock?.questions[questionIndex];
  const answered = answers.filter((answer) => answer !== null).length;
  const score = mock?.questions.reduce((total, item, index) => total + Number(answers[index] === item.answer), 0) ?? 0;

  useEffect(() => {
    getN3Results().then(setBest).catch(() => setSaveError(true));
  }, []);

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
    saveN3Result(mock.id, score, mock.questions.length).then(setBest).catch(() => setSaveError(true));
  }, [mock, score, submitted]);

  function start(index: number) {
    const next = n3GrammarMocks[index];
    setMockIndex(index);
    setQuestionIndex(0);
    setAnswers(Array(next.questions.length).fill(null));
    setRemaining(next.minutes * 60);
    setDeadline(0);
    setSubmitted(false);
    setSaveError(false);
  }

  function back() {
    if (mockIndex === null) router.back();
    else setMockIndex(null);
  }

  function choose(choice: string) {
    if (submitted) return;
    setAnswers((current) => current.map((answer, index) => index === questionIndex ? choice : answer));
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><HeaderBackButton onPress={back} /><Text style={s.headerTitle}>N3 문법 실전 연습</Text><View style={s.headerSpacer} /></View>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {!mock ? <>
          <View style={s.hero}><Text style={s.eyebrow}>시간제한 문법 연습</Text><Text style={s.title}>문법 모의고사</Text><Text style={s.body}>회차마다 자체 작성 20문항을 25분 안에 풉니다. 문법 형식·문장 배열·글의 흐름을 연습하고 제출 후 정답과 해설을 확인하세요.</Text><Text style={s.notice}>이 모의고사는 문법만 다루는 앱 연습 자료입니다. 실제 N3의 문법·독해 통합 70분 시험이나 공식 문제와 동일하지 않습니다.</Text></View>
          {n3GrammarMocks.map((item, index) => <Pressable key={item.id} onPress={() => start(index)} style={s.card} accessibilityRole="button" accessibilityLabel={`${item.title} 시작`}><View style={s.cardTop}><Text style={s.cardTitle}>{item.title}</Text><Text style={s.chevron}>›</Text></View><Text style={s.body}>{item.questions.length}문항 · {item.minutes}분 · 문법 형식 12 / 문장 배열 4 / 글의 흐름 4</Text>{best[item.id] ? <Text style={s.best}>최고 {best[item.id].score}/{best[item.id].total}점</Text> : null}</Pressable>)}
          <View style={s.official}><Text style={s.cardTitle}>JLPT 공식 예제·문제집</Text><Text style={s.body}>공식 사이트에서 N3 2012·2018 문제집의 문법·독해 PDF와 정답을 확인할 수 있습니다. 인터넷 연결이 필요합니다.</Text><Link href={officialUrl} target="_blank" style={s.officialLink}>JLPT 공식 자료 열기 ↗</Link></View>
        </> : submitted ? <>
          <View style={s.hero}><Text style={s.eyebrow}>{mock.title} · 결과</Text><Text style={s.title}>{score} / {mock.questions.length} 정답</Text><Text style={s.body}>미응답 {mock.questions.length - answered}문항 · 오답과 미응답을 아래에서 확인하세요.</Text><Text style={s.notice}>이 점수는 문법 단독 연습 결과이며 JLPT 합격 점수로 환산되지 않습니다.</Text></View>
          {mock.questions.map((item, index) => <View key={index} style={s.review}><Text style={s.eyebrow}>{index + 1}. {item.kind} · {answers[index] === item.answer ? '정답' : '오답'}</Text><Text style={s.prompt}>{item.prompt}</Text><Text style={s.reviewAnswer}>내 답: {answers[index] ?? '미응답'} · 정답: {item.answer}</Text><Text style={s.body}>{item.explanation}</Text></View>)}
          <Pressable onPress={() => start(mockIndex!)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>다시 풀기</Text></Pressable>
          <Pressable onPress={() => setMockIndex(null)} style={s.secondary} accessibilityRole="button"><Text style={s.secondaryText}>다른 회차 보기</Text></Pressable>
        </> : question ? <>
          <View style={s.progress}><Text style={s.eyebrow}>{mock.title} · {questionIndex + 1}/{mock.questions.length}</Text><Text style={s.timer}>남은 시간 {clock(remaining)}</Text></View>
          <View style={s.track}><View style={[s.trackFill, { width: `${((questionIndex + 1) / mock.questions.length) * 100}%` }]} /></View>
          <View style={s.card}><Text style={s.eyebrow}>{question.kind}</Text><Text style={s.prompt}>{question.prompt}</Text></View>
          {question.choices.map((choice) => <Pressable key={choice} onPress={() => choose(choice)} style={[s.choice, answers[questionIndex] === choice && s.choiceSelected]} accessibilityRole="button" accessibilityState={{ selected: answers[questionIndex] === choice }}><Text style={s.choiceText}>{choice}</Text></Pressable>)}
          <Text style={s.answered}>답한 문제 {answered}/{mock.questions.length} · 제출 전까지 정답은 표시하지 않습니다.</Text>
          <View style={s.navigation}><Pressable onPress={() => setQuestionIndex(Math.max(0, questionIndex - 1))} disabled={questionIndex === 0} style={[s.navButton, questionIndex === 0 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>이전</Text></Pressable><Pressable onPress={() => setQuestionIndex(Math.min(mock.questions.length - 1, questionIndex + 1))} disabled={questionIndex === mock.questions.length - 1} style={[s.navButton, questionIndex === mock.questions.length - 1 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>다음</Text></Pressable></View>
          <Pressable onPress={() => setSubmitted(true)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>제출하고 채점하기</Text></Pressable>
        </> : null}
        {saveError ? <Text style={s.error}>최고 점수를 저장하거나 불러오지 못했습니다. 저장 공간을 확인해 주세요.</Text> : null}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, scroll: { flexGrow: 1, paddingBottom: 32 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }, headerTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 }, headerSpacer: { width: 40 },
  hero: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 19, padding: 20, marginBottom: 14 }, eyebrow: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, title: { color: colors.ink, fontFamily: fonts.bold, fontSize: 21, marginTop: 8 }, body: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 8 }, notice: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, lineHeight: 18, marginTop: 12 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 18, marginBottom: 12 }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cardTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 15 }, chevron: { color: colors.pink, fontSize: 25 }, best: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 9 },
  official: { backgroundColor: colors.white, borderRadius: 14, padding: 18, marginTop: 8 }, officialLink: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13, marginTop: 13 },
  progress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, timer: { color: colors.ink, fontFamily: fonts.number, fontSize: 14 }, track: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden', marginVertical: 17 }, trackFill: { height: 6, backgroundColor: colors.pink },
  prompt: { color: colors.ink, fontFamily: fonts.jp, fontSize: 17, lineHeight: 28, marginTop: 10 }, choice: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, minHeight: 52, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 10, marginBottom: 9 }, choiceSelected: { borderColor: colors.pink, backgroundColor: colors.pale }, choiceText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 15, lineHeight: 22 }, answered: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 7 },
  navigation: { flexDirection: 'row', gap: 10, marginTop: 18 }, navButton: { flex: 1, alignItems: 'center', paddingVertical: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.pink, borderRadius: 10 }, disabled: { opacity: 0.35 }, primary: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pink, borderRadius: 11, minHeight: 48, marginTop: 15 }, primaryText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 }, secondary: { alignItems: 'center', paddingVertical: 14 }, secondaryText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13 },
  review: { backgroundColor: colors.white, borderRadius: 13, padding: 16, marginBottom: 11 }, reviewAnswer: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 9 }, error: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, marginTop: 12 },
});
