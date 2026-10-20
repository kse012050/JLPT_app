import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getWrongQuestions, saveQuestionAttempts, type ReviewArea, type WrongQuestion } from '@/storage/wrong-questions';
import { playListeningTranscript, stopListeningPlayback } from '@/utils/listening-playback';

const areas: { id: ReviewArea; label: string }[] = [
  { id: 'vocabulary', label: '문자·어휘' }, { id: 'grammar', label: '문법' },
  { id: 'reading', label: '독해' }, { id: 'listening', label: '청해' },
];
const c = { bg: '#F7F7FB', white: '#fff', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', greenPale: '#E5F8EF', line: '#ECE9F0' };
const f = { body: 'NotoSansKR_400Regular', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular' };

export default function ReviewScreen() {
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [active, setActive] = useState<WrongQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    setLoading(true);
    getWrongQuestions().then((items) => { if (mounted) { setQuestions(items); setLoading(false); } })
      .catch(() => { if (mounted) { setError(true); setLoading(false); } });
    return () => { mounted = false; void stopListeningPlayback(); };
  }, []));

  function open(item: WrongQuestion) {
    void stopListeningPlayback();
    setActive(item); setSelected(null); setChecked(false);
  }
  function close() { void stopListeningPlayback(); setActive(null); setSelected(null); setChecked(false); }
  async function check() {
    if (!active || selected === null || checked) return;
    try { setQuestions(await saveQuestionAttempts([{ question: active, selected }])); setChecked(true); }
    catch { setError(true); }
  }
  const correct = !!active && selected === active.answer;

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><Text style={s.headerTitle}>복습 노트</Text></View>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}><View style={s.content}>
      {active ? <>
        <Pressable onPress={close} style={s.back} accessibilityRole="button"><Text style={s.link}>‹ 오답 목록</Text></Pressable>
        <View style={s.hero}><Text style={s.eyebrow}>{areas.find((area) => area.id === active.area)?.label} · {active.source}</Text><Text style={s.title}>{active.kind}</Text><Text style={s.body}>다시 맞히면 복습 목록에서 자동으로 빠집니다.</Text></View>
        {active.passage ? <View style={s.card}><Text style={s.eyebrow}>지문</Text><Text style={s.japanese}>{active.passage}</Text></View> : null}
        {active.transcript ? <Pressable onPress={() => { void playListeningTranscript(active.transcript!, () => setError(true)).catch(() => setError(true)); }} style={s.audio} accessibilityRole="button"><Text style={s.link}>일본어 음성 다시 듣기 ▶</Text></Pressable> : null}
        <View style={s.card}><Text style={s.eyebrow}>문제</Text><Text style={s.prompt}>{active.prompt}</Text></View>
        {active.choices.map((choice, index) => <Pressable key={`${index}-${choice}`} onPress={() => setSelected(choice)} disabled={checked} style={[s.choice, selected === choice && s.selected, checked && choice === active.answer && s.correct, checked && selected === choice && !correct && s.wrong]} accessibilityRole="button" accessibilityState={{ selected: selected === choice }}><Text style={s.choiceText}>{choice}</Text></Pressable>)}
        {checked ? <View style={[s.feedback, correct ? s.feedbackCorrect : s.feedbackWrong]}><Text style={s.feedbackTitle}>{correct ? '정답이에요! 복습 목록에서 뺐습니다.' : `아쉬워요. 정답: ${active.answer}`}</Text>{active.transcript ? <Text style={s.japanese}>{active.transcript}</Text> : null}{active.explanation ? <Text style={s.body}>{active.explanation}</Text> : null}</View> : null}
        <Pressable onPress={checked ? (correct ? close : () => open(active)) : check} disabled={!checked && selected === null} style={[s.primary, !checked && selected === null && s.disabled]} accessibilityRole="button"><Text style={s.primaryText}>{checked ? (correct ? '오답 목록 보기' : '이 문제 다시 풀기') : '정답 확인'}</Text></Pressable>
      </> : <>
        <View style={s.hero}><Text style={s.eyebrow}>내가 틀린 문제</Text><Text style={s.title}>다시 풀며 익혀요</Text><Text style={s.body}>학습과 모의고사에서 틀린 문제를 모았습니다. 맞힐 때까지 반복해서 풀어 보세요.</Text><Text style={s.count}>{loading ? '불러오는 중' : `${questions.length}문제 복습 대기`}</Text></View>
        {!loading && questions.length === 0 ? <View style={s.empty}><Text style={s.emptyTitle}>아직 복습할 오답이 없어요</Text><Text style={s.body}>문제를 풀고 틀린 항목이 생기면 여기에 표시됩니다.</Text></View> : null}
        {areas.map((area) => { const items = questions.filter((item) => item.area === area.id); return items.length ? <View key={area.id} style={s.section}><Text style={s.sectionTitle}>{area.label} · {items.length}</Text>{items.map((item) => <Pressable key={item.id} onPress={() => open(item)} style={s.item} accessibilityRole="button" accessibilityLabel={`${item.source}, ${item.kind}, 다시 풀기`}><View style={s.itemBody}><Text style={s.itemSource}>{item.source} · {item.kind}</Text><Text style={s.itemPrompt} numberOfLines={2}>{item.prompt}</Text></View><Text style={s.chevron}>›</Text></Pressable>)}</View> : null; })}
      </>}
      {error ? <Text style={s.error}>복습 기록을 저장하거나 불러오지 못했습니다. 기기 저장 공간을 확인해 주세요.</Text> : null}
    </View></ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg }, header: { height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.line }, headerTitle: { color: c.ink, fontFamily: f.bold, fontSize: 16 }, scroll: { paddingBottom: 36 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 }, hero: { backgroundColor: c.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 18, padding: 20 }, eyebrow: { color: c.pink, fontFamily: f.bold, fontSize: 11 }, title: { color: c.ink, fontFamily: f.bold, fontSize: 22, marginTop: 6 }, body: { color: c.muted, fontFamily: f.body, fontSize: 12, lineHeight: 21, marginTop: 8 }, count: { color: c.green, fontFamily: f.semi, fontSize: 12, marginTop: 14 }, empty: { alignItems: 'center', backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 16, padding: 26, marginTop: 16 }, emptyTitle: { color: c.ink, fontFamily: f.bold, fontSize: 15 }, section: { marginTop: 24 }, sectionTitle: { color: c.ink, fontFamily: f.bold, fontSize: 17, marginBottom: 10 }, item: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 13, padding: 15, marginBottom: 9 }, itemBody: { flex: 1 }, itemSource: { color: c.pink, fontFamily: f.semi, fontSize: 11 }, itemPrompt: { color: c.ink, fontFamily: f.jp, fontSize: 14, lineHeight: 23, marginTop: 5 }, chevron: { color: c.pink, fontSize: 23, marginLeft: 8 }, back: { alignSelf: 'flex-start', paddingVertical: 9, marginBottom: 8 }, link: { color: c.pink, fontFamily: f.bold, fontSize: 13 }, card: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 18, marginTop: 14, marginBottom: 12 }, japanese: { color: c.ink, fontFamily: f.jp, fontSize: 14, lineHeight: 26, marginTop: 9 }, audio: { backgroundColor: c.pale, borderRadius: 11, alignItems: 'center', padding: 15, marginTop: 14 }, prompt: { color: c.ink, fontFamily: f.jp, fontSize: 17, lineHeight: 29, marginTop: 8 }, choice: { minHeight: 52, justifyContent: 'center', backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 11, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 9 }, selected: { borderColor: c.pink, backgroundColor: c.pale }, correct: { borderColor: c.green, backgroundColor: c.greenPale }, wrong: { borderColor: c.pink, backgroundColor: c.pale }, choiceText: { color: c.ink, fontFamily: f.jp, fontSize: 14, lineHeight: 23 }, feedback: { borderRadius: 12, padding: 16, marginTop: 5 }, feedbackCorrect: { backgroundColor: c.greenPale }, feedbackWrong: { backgroundColor: c.pale }, feedbackTitle: { color: c.ink, fontFamily: f.bold, fontSize: 13 }, primary: { height: 49, justifyContent: 'center', alignItems: 'center', backgroundColor: c.pink, borderRadius: 11, marginTop: 17 }, primaryText: { color: c.white, fontFamily: f.bold, fontSize: 14 }, disabled: { opacity: 0.4 }, error: { color: c.pink, fontFamily: f.semi, fontSize: 11, lineHeight: 18, marginTop: 14 },
});
