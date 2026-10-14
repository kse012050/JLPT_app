import * as Speech from 'expo-speech';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import { n3ListeningMocks } from '@/content/n3-listening-mock';
import { questionChoices } from '@/content/question-choices';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';

const colors = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', line: '#ECE9F0' };
const fonts = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular', number: 'PlusJakartaSans_700Bold' };
const officialUrl = 'https://www.jlpt.jp/e/samples/sampleindex.html';
const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function N3ListeningMockScreen() {
  const scroll = useRef<ScrollView>(null);
  const [mockIndex, setMockIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [best, setBest] = useState<N3Results>({});
  const [saveError, setSaveError] = useState(false);
  const [speechError, setSpeechError] = useState(false);

  const mock = mockIndex === null ? null : n3ListeningMocks[mockIndex];
  const current = mock?.items[questionIndex];
  const answered = answers.filter((answer) => answer !== null).length;
  const score = mock?.items.reduce((total, item, index) => total + Number(answers[index] === item.question.answer), 0) ?? 0;

  useEffect(() => { getN3Results().then(setBest).catch(() => setSaveError(true)); }, []);
  useEffect(() => () => { void Speech.stop(); }, []);
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
    void Speech.stop();
    saveN3Result(mock.id, score, mock.items.length).then(setBest).catch(() => setSaveError(true));
  }, [mock, score, submitted]);

  function start(index: number) {
    void Speech.stop();
    const next = n3ListeningMocks[index];
    setMockIndex(index);
    setQuestionIndex(0);
    setAnswers(Array(next.items.length).fill(null));
    setRemaining(next.minutes * 60);
    setDeadline(0);
    setSubmitted(false);
    setSaveError(false);
    setSpeechError(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function navigate(index: number) {
    void Speech.stop();
    setSpeechError(false);
    setQuestionIndex(index);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }

  function back() {
    void Speech.stop();
    if (mockIndex === null) router.back();
    else { setMockIndex(null); setSubmitted(false); setDeadline(0); }
  }

  function play() {
    if (!current) return;
    setSpeechError(false);
    void Speech.stop().then(() => Speech.speak(current.transcript, { language: 'ja-JP', rate: 0.9, onError: () => setSpeechError(true) })).catch(() => setSpeechError(true));
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><HeaderBackButton onPress={back} /><Text style={s.headerTitle}>N3 청해 실전 연습</Text><View style={s.headerSpacer} /></View>
    <ScrollView ref={scroll} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {!mock ? <>
          <View style={s.hero}><Text style={s.eyebrow}>시간제한 청해 연습</Text><Text style={s.title}>청해 모의고사</Text><Text style={s.body}>회차마다 과제 이해·요점 이해·개요 이해·발화 표현·즉시 응답을 한 문제씩 듣고 풉니다. 제출 후 대본과 해설을 확인할 수 있습니다.</Text><Text style={s.notice}>음성은 기기의 일본어 음성 합성입니다. 회차당 5문항·10분은 앱 연습 기준이며 실제 N3 청해 시험과 분량·음질·점수 체계가 다릅니다.</Text></View>
          {n3ListeningMocks.map((item, index) => <Pressable key={item.id} onPress={() => start(index)} style={s.card} accessibilityRole="button" accessibilityLabel={`${item.title} 시작`}><Text style={s.cardTitle}>{item.title} ›</Text><Text style={s.body}>{item.items.length}문항 · {item.minutes}분</Text>{best[item.id] ? <Text style={s.best}>최고 {best[item.id].score}/{best[item.id].total}점</Text> : null}</Pressable>)}
          <View style={s.card}><Text style={s.cardTitle}>JLPT 공식 청해 자료</Text><Text style={s.body}>실제 음성과 문제 형식은 JLPT 공식 자료에서 확인하세요. 인터넷 연결이 필요합니다.</Text><Link href={officialUrl} target="_blank" style={s.officialLink}>JLPT 공식 자료 열기 ↗</Link></View>
        </> : submitted ? <>
          <View style={s.hero}><Text style={s.eyebrow}>{mock.title} · 결과</Text><Text style={s.title}>{score} / {mock.items.length} 정답</Text><Text style={s.body}>미응답 {mock.items.length - answered}문항 · 대본과 해설을 아래에서 확인하세요.</Text><Text style={s.notice}>이 점수는 앱의 청해 연습 결과이며 JLPT 점수로 환산되지 않습니다.</Text></View>
          {mock.items.map((item, index) => <View key={item.id} style={s.card}><Text style={s.eyebrow}>{index + 1}. {item.kind} · {answers[index] === item.question.answer ? '정답' : '오답'}</Text><Text style={s.transcript}>{item.transcript}</Text><Text style={s.prompt}>{item.question.prompt}</Text><Text style={s.answer}>내 답: {answers[index] ?? '미응답'} · 정답: {item.question.answer}</Text><Text style={s.body}>{item.question.explanation}</Text></View>)}
          <Pressable onPress={() => start(mockIndex!)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>다시 풀기</Text></Pressable>
          <Pressable onPress={back} style={s.secondary} accessibilityRole="button"><Text style={s.secondaryText}>다른 회차 보기</Text></Pressable>
        </> : current ? <>
          <View style={s.progress}><Text style={s.eyebrow}>{mock.title} · {questionIndex + 1}/{mock.items.length}</Text><Text style={s.timer}>남은 시간 {clock(remaining)}</Text></View>
          <View style={s.track}><View style={[s.trackFill, { width: `${((questionIndex + 1) / mock.items.length) * 100}%` }]} /></View>
          <View style={s.card}><Text style={s.eyebrow}>{current.kind} · 음성 듣기</Text><Text style={s.body}>일본어 음성을 듣고 답을 고르세요. 다시 들을 수 있습니다.</Text><Pressable onPress={play} style={s.audioButton} accessibilityRole="button" accessibilityLabel="일본어 음성 재생"><Text style={s.audioButtonText}>▶  일본어 듣기</Text></Pressable>{speechError ? <Text style={s.notice}>일본어 음성을 재생하지 못했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}</View>
          <View style={s.card}><Text style={s.prompt}>{current.question.prompt}</Text></View>
          {questionChoices(current.question).map((choice) => <Pressable key={choice} onPress={() => setAnswers((previous) => previous.map((answer, index) => index === questionIndex ? choice : answer))} style={[s.choice, answers[questionIndex] === choice && s.choiceSelected]} accessibilityRole="button" accessibilityState={{ selected: answers[questionIndex] === choice }}><Text style={s.choiceText}>{choice}</Text></Pressable>)}
          <Text style={s.answered}>답한 문제 {answered}/{mock.items.length} · 제출 전에는 정답과 대본을 표시하지 않습니다.</Text>
          <View style={s.navigation}><Pressable onPress={() => navigate(Math.max(0, questionIndex - 1))} disabled={questionIndex === 0} style={[s.navButton, questionIndex === 0 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>이전</Text></Pressable><Pressable onPress={() => navigate(Math.min(mock.items.length - 1, questionIndex + 1))} disabled={questionIndex === mock.items.length - 1} style={[s.navButton, questionIndex === mock.items.length - 1 && s.disabled]} accessibilityRole="button"><Text style={s.secondaryText}>다음</Text></Pressable></View>
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
  transcript: { color: colors.ink, fontFamily: fonts.jp, fontSize: 14, lineHeight: 26, marginTop: 10 }, prompt: { color: colors.ink, fontFamily: fonts.jp, fontSize: 16, lineHeight: 27 }, choice: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, minHeight: 52, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 10, marginBottom: 9 }, choiceSelected: { borderColor: colors.pink, backgroundColor: colors.pale }, choiceText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 14, lineHeight: 23 }, answered: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 7 }, answer: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 9 },
  audioButton: { backgroundColor: colors.pale, borderRadius: 10, alignItems: 'center', padding: 13, marginTop: 12 }, audioButtonText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13 }, navigation: { flexDirection: 'row', gap: 10, marginTop: 18 }, navButton: { flex: 1, alignItems: 'center', paddingVertical: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.pink, borderRadius: 10 }, disabled: { opacity: 0.35 }, primary: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pink, borderRadius: 11, minHeight: 48, marginTop: 15 }, primaryText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 }, secondary: { alignItems: 'center', paddingVertical: 14 }, secondaryText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13 },
});
