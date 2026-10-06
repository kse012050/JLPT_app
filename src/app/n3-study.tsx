import * as Speech from 'expo-speech';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { n3Areas, unitsForArea, type ChoiceQuestion, type N3Area, type N3Unit } from '@/content/n3';
import kanjiReference from '@/content/n3-kanji-reference.json';
import { bankCounts, type BankLevel } from '@/content/n3-vocabulary-bank';
import { batchCount, resultKey, wordsForBatch } from '@/content/n3-vocabulary-quiz';
import { getN3Results, saveN3Result, type N3Results } from '@/storage/n3-progress';

type Stage = 'units' | 'learn' | 'quiz' | 'result';
const colors = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', greenPale: '#E5F8EF', line: '#ECE9F0' };
const fonts = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_400Regular', jpBold: 'NotoSansJP_700Bold', number: 'PlusJakartaSans_700Bold' };

function questionsFor(unit: N3Unit): ChoiceQuestion[] {
  if (unit.vocabulary) return [
    ...unit.vocabulary.flatMap((word, index): ChoiceQuestion[] => {
      const words = unit.vocabulary!;
      const options = (field: 'word' | 'reading' | 'meaning'): [string, string, string, string] => {
        const candidates = words.filter((_, itemIndex) => itemIndex !== index).map((item) => item[field]);
        const distractors = [0, 1, 2].map((offset) => candidates[(index + offset) % candidates.length]);
        const choices = [...distractors];
        choices.splice(index % 4, 0, word[field]);
        return choices as [string, string, string, string];
      };
      const explanation = `${word.word} · ${word.reading} · ${word.meaning}\n${word.example}\n${word.translation}`;
      const first: ChoiceQuestion = index % 2 === 0
        ? { kind: '한자 읽기', prompt: `「${word.word}」의 읽기는 무엇인가요?`, choices: options('reading'), answer: word.reading, explanation }
        : { kind: '표기', prompt: `「${word.reading}」에 해당하는 말은 무엇인가요?`, choices: options('word'), answer: word.word, explanation };
      const second: ChoiceQuestion = index % 2 === 0 && word.example.includes(word.word)
        ? { kind: '문맥', prompt: `${word.example.replace(word.word, '（　）')}\n빈칸에 들어갈 말은 무엇인가요?`, choices: options('word'), answer: word.word, explanation }
        : { kind: '뜻', prompt: `「${word.word}」의 뜻은 무엇인가요?`, choices: options('meaning'), answer: word.meaning, explanation };
      return [first, second];
    }),
    ...(unit.questions ?? []),
  ];
  if (unit.grammar) return unit.grammar.map((entry) => entry.question);
  return [...(unit.questions ?? [])];
}

export default function N3StudyScreen() {
  const params = useLocalSearchParams<{ area?: string }>();
  const area: N3Area = n3Areas.some((item) => item.id === params.area) ? params.area as N3Area : 'vocabulary';
  const section = n3Areas.find((item) => item.id === area)!;
  const units = unitsForArea(area);
  const [stage, setStage] = useState<Stage>('units');
  const [unit, setUnit] = useState<N3Unit | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<N3Results>({});
  const [saveError, setSaveError] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const [bankLevel, setBankLevel] = useState<BankLevel>('N3');
  const [bankPage, setBankPage] = useState(0);
  const questions = useMemo(() => unit ? questionsFor(unit) : [], [unit]);
  const current = questions[index];
  const entry = unit?.vocabulary?.[index] ?? unit?.grammar?.[index];

  const bankUnitCount = batchCount('N3') + batchCount('N4') + batchCount('N5');
  const bankCompleted = (['N3', 'N4', 'N5'] as const).reduce((total, level) => total + Array.from({ length: batchCount(level) }, (_, batch) => resultKey(level, batch)).filter((key) => results[key]).length, 0);
  const bankPageCount = Math.ceil(batchCount(bankLevel) / 10);

  useFocusEffect(useCallback(() => {
    let active = true;
    getN3Results().then((saved) => { if (active) setResults(saved); }).catch(() => { if (active) setSaveError(true); });
    return () => { active = false; };
  }, []));
  useEffect(() => () => { void Speech.stop(); }, []);

  function start(next: N3Unit) {
    void Speech.stop();
    setUnit(next);
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setShowTranscript(false);
    setSpeechError(false);
    setStage(next.vocabulary || next.grammar ? 'learn' : 'quiz');
  }

  function back() {
    void Speech.stop();
    if (stage === 'units') router.back();
    else { setStage('units'); setUnit(null); }
  }

  async function nextQuestion() {
    if (!unit || !current || selected === null) return;
    const nextCorrect = correct + Number(selected === current.answer);
    setCorrect(nextCorrect);
    setSelected(null);
    setShowTranscript(false);
    if (index < questions.length - 1) { setIndex(index + 1); return; }
    setStage('result');
    try { setResults(await saveN3Result(unit.id, nextCorrect, questions.length)); }
    catch { setSaveError(true); }
  }

  function playAudio() {
    if (!unit?.transcript) return;
    setSpeechError(false);
    void Speech.stop().then(() => Speech.speak(unit.transcript!, { language: 'ja-JP', rate: 0.9, onError: () => setSpeechError(true) })).catch(() => setSpeechError(true));
  }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}><Pressable onPress={back} style={s.back} accessibilityRole="button" accessibilityLabel="뒤로 가기"><Text style={s.backText}>‹</Text></Pressable><Text style={s.headerTitle}>N3 {section.title}</Text><View style={s.back} /></View>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {stage === 'units' ? <>
          <View style={s.hero}><Text style={s.eyebrow}>{area === 'vocabulary' ? 'N3 · N4 · N5 어휘 학습' : 'N3 · 자체 작성 기초 연습 자료'}</Text><Text style={s.heroTitle}>{section.title}부터 차근차근</Text><Text style={s.heroText}>{area === 'vocabulary' ? `중복을 제거한 어휘 ${bankCounts.total.toLocaleString()}개를 20개씩 학습하고 뜻 문제를 풉니다.` : `${section.description} 중심으로 연습합니다. ${area === 'listening' ? '음성은 기기의 일본어 음성 읽기로 재생됩니다.' : '학습 후 문제를 풀고 해설을 확인하세요.'}`}</Text><Text style={s.heroProgress}>{area === 'vocabulary' ? `어휘 학습 단원 ${bankCompleted} / ${bankUnitCount}개 풀이` : `수록된 단원 중 ${units.filter((item) => results[item.id]).length} / ${units.length}개 풀이`}</Text></View>
          {area === 'vocabulary' ? <Pressable onPress={() => router.push('/n3-kanji-drill')} style={s.unitCard} accessibilityRole="button" accessibilityLabel="N3 한자 읽기 참고 연습 열기"><View style={s.unitNumber}><Text style={s.unitNumberText}>漢</Text></View><View style={s.flex}><Text style={s.unitTitle}>한자 읽기 {kanjiReference.items.length}개 참고 연습</Text><Text style={s.unitDescription}>공개 어휘 목록을 사전과 대조한 읽기 문제 · 뜻과 문맥은 포함하지 않음</Text></View><Text style={s.chevron}>›</Text></Pressable> : null}
          {area === 'vocabulary' || area === 'grammar' ? <Pressable onPress={() => router.push({ pathname: '/n3-reference', params: { kind: area } })} style={s.unitCard} accessibilityRole="button" accessibilityLabel="N3 확장 참고 자료 열기"><View style={s.unitNumber}><Text style={s.unitNumberText}>本</Text></View><View style={s.flex}><Text style={s.unitTitle}>{area === 'vocabulary' ? '공개 참고 어휘 2,963개' : '문법 280개'} 찾아보기</Text><Text style={s.unitDescription}>N3와 선행 N4·N5 · 한국어 뜻과 예문 · 검색 및 학습 표시</Text></View><Text style={s.chevron}>›</Text></Pressable> : null}
          <Text style={s.sectionTitle}>학습 단원</Text>
          {area === 'vocabulary' ? <>
            <View style={s.bankLevels}>{(['N3', 'N4', 'N5'] as const).map((level) => <Pressable key={level} onPress={() => { setBankLevel(level); setBankPage(0); }} style={[s.bankLevel, bankLevel === level && s.bankLevelActive]} accessibilityRole="button"><Text style={[s.bankLevelText, bankLevel === level && s.bankLevelTextActive]}>{level} · {batchCount(level)}단원</Text></Pressable>)}</View>
            <Text style={s.bankCount}>전체 {bankUnitCount}단원 · {bankCounts.total.toLocaleString()}개 어휘</Text>
            {Array.from({ length: Math.min(10, batchCount(bankLevel) - bankPage * 10) }, (_, offset) => bankPage * 10 + offset).map((batch) => {
              const words = wordsForBatch(bankLevel, batch);
              const result = results[resultKey(bankLevel, batch)];
              return <Pressable key={`${bankLevel}-${batch}`} onPress={() => router.push({ pathname: '/n3-vocabulary-bank', params: { level: bankLevel, batch: String(batch) } })} style={s.unitCard} accessibilityRole="button" accessibilityLabel={`${bankLevel} 어휘 ${batch + 1}단원 시작`}><View style={s.unitNumber}><Text style={s.unitNumberText}>{String(batch + 1).padStart(2, '0')}</Text></View><View style={s.flex}><Text style={s.unitTitle}>{bankLevel} 어휘 {batch + 1}단원</Text><Text style={s.unitDescription}>{words[0].word} · {words[1]?.word ?? ''} 외 {words.length}개 어휘</Text><Text style={s.unitMeta}>{words.length}개 학습 항목{result ? ` · 최고 ${result.score}/${result.total}` : ''}</Text></View><Text style={s.chevron}>›</Text></Pressable>;
            })}
            <View style={s.bankPager}><Pressable onPress={() => setBankPage(Math.max(0, bankPage - 1))} disabled={bankPage === 0} style={s.bankPagerButton} accessibilityRole="button"><Text style={s.bankPagerText}>‹ 이전</Text></Pressable><Text style={s.bankPageText}>{bankPage + 1} / {bankPageCount}쪽</Text><Pressable onPress={() => setBankPage(Math.min(bankPageCount - 1, bankPage + 1))} disabled={bankPage + 1 === bankPageCount} style={s.bankPagerButton} accessibilityRole="button"><Text style={s.bankPagerText}>다음 ›</Text></Pressable></View>
            <Text style={s.sectionTitle}>주제별 복습</Text>
            <Text style={s.note}>기존 한국어 해설 어휘 144개를 주제별로 다시 연습할 수 있습니다. 위 전체 학습 단원에도 중복 없이 포함되어 있습니다.</Text>
          </> : null}
          {units.map((item, itemIndex) => <Pressable key={item.id} onPress={() => start(item)} style={s.unitCard} accessibilityRole="button" accessibilityLabel={`${item.title} 시작`}><View style={s.unitNumber}><Text style={s.unitNumberText}>{String(itemIndex + 1).padStart(2, '0')}</Text></View><View style={s.flex}><Text style={s.unitTitle}>{item.title}</Text><Text style={s.unitDescription}>{item.description}</Text><Text style={s.unitMeta}>{item.vocabulary?.length ?? item.grammar?.length ?? item.questions?.length}개 {item.vocabulary || item.grammar ? '학습 항목' : '문제'}{results[item.id] ? ` · 최고 ${results[item.id].score}/${results[item.id].total}` : ''}</Text></View><Text style={s.chevron}>›</Text></Pressable>)}
          <Text style={s.note}>이 자료는 JLPT 공식 문제나 지정 어휘 목록이 아니며, 이 단원을 모두 풀어도 N3 합격 준비가 끝나는 것은 아닙니다. 실전 문제와 시간제한 모의고사를 추가로 연습하세요.</Text>
        </> : null}

        {stage === 'learn' && unit && entry ? <>
          <View style={s.stepRow}><Text style={s.stepLabel}>{unit.title} · 학습</Text><Text style={s.stepCount}>{index + 1} / {unit.vocabulary?.length ?? unit.grammar?.length}</Text></View><View style={s.track}><View style={[s.trackFill, { width: `${((index + 1) / (unit.vocabulary?.length ?? unit.grammar?.length ?? 1)) * 100}%` }]} /></View>
          <View style={s.learnCard}>
            <Text style={s.cardLabel}>{unit.vocabulary ? '단어와 읽기' : '문법 표현'}</Text>
            <Text style={s.learnMain}>{'word' in entry ? entry.word : entry.pattern}</Text>
            {'reading' in entry ? <Text style={s.learnReading}>{entry.reading}</Text> : null}
            <View style={s.divider} /><Text style={s.cardLabel}>뜻과 쓰임</Text><Text style={s.learnMeaning}>{entry.meaning}</Text>
            {'explanation' in entry ? <Text style={s.learnExplanation}>{entry.explanation}</Text> : null}
          </View>
          <View style={s.exampleCard}><Text style={s.cardLabel}>예문</Text><Text style={s.exampleJapanese}>{entry.example}</Text><Text style={s.exampleKorean}>{entry.translation}</Text></View>
        </> : null}

        {stage === 'quiz' && unit && current ? <>
          <View style={s.stepRow}><Text style={s.stepLabel}>{unit.title} · 확인 문제</Text><Text style={s.stepCount}>{index + 1} / {questions.length}</Text></View><View style={s.track}><View style={[s.trackFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View>
          {unit.passage ? <View style={s.sourceCard}><Text style={s.cardLabel}>지문</Text><Text style={s.sourceText}>{unit.passage}</Text></View> : null}
          {unit.transcript ? <View style={s.sourceCard}><Text style={s.cardLabel}>음성 듣기</Text><Text style={s.audioIntro}>일본어 음성을 듣고 답을 고르세요. 다시 들을 수 있습니다.</Text><Pressable onPress={playAudio} style={s.audioButton} accessibilityRole="button"><Text style={s.audioButtonText}>▶  일본어 듣기</Text></Pressable>{speechError ? <Text style={s.error}>일본어 음성을 재생하지 못했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}{selected !== null || showTranscript ? <><Text style={s.transcriptLabel}>대본</Text><Text style={s.sourceText}>{unit.transcript}</Text></> : null}</View> : null}
          <View style={s.questionCard}><Text style={s.questionType}>{current.kind ?? '확인 문제'} · {index + 1}</Text><Text style={s.questionText}>{current.prompt}</Text></View>
          <View style={s.choices}>{current.choices.map((choice) => <Pressable key={choice} disabled={selected !== null} onPress={() => setSelected(choice)} style={[s.choice, selected !== null && choice === current.answer && s.choiceCorrect, selected === choice && choice !== current.answer && s.choiceWrong]} accessibilityRole="button"><Text style={s.choiceText}>{choice}</Text></Pressable>)}</View>
          {selected !== null ? <View style={[s.feedback, selected === current.answer ? s.feedbackCorrect : s.feedbackWrong]}><Text style={s.feedbackTitle}>{selected === current.answer ? '정답이에요!' : `정답: ${current.answer}`}</Text><Text style={s.feedbackDetail}>{current.explanation}</Text></View> : null}
          {unit.transcript && selected === null ? <Pressable onPress={() => setShowTranscript(!showTranscript)} style={s.scriptButton} accessibilityRole="button"><Text style={s.scriptButtonText}>{showTranscript ? '대본 숨기기' : '대본 보기'}</Text></Pressable> : null}
        </> : null}

        {stage === 'result' && unit ? <View style={s.resultCard}><Text style={s.resultSymbol}>✓</Text><Text style={s.resultTitle}>문제를 모두 풀었어요</Text><Text style={s.resultScore}>{correct} / {questions.length} 정답</Text><Text style={s.resultText}>최고 점수가 이 기기에 저장됩니다. 틀린 내용은 해설을 참고하고 다시 풀어 보세요.</Text></View> : null}
        {saveError ? <Text style={s.error}>학습 기록을 저장하거나 불러오지 못했습니다. 기기 저장 공간을 확인해 주세요.</Text> : null}
      </View>
    </ScrollView>
    {stage !== 'units' ? <View style={s.bottom}>
      {stage === 'learn' && unit ? <Pressable onPress={() => index < (unit.vocabulary?.length ?? unit.grammar?.length ?? 0) - 1 ? setIndex(index + 1) : (setIndex(0), setStage('quiz'))} style={s.primaryButton} accessibilityRole="button"><Text style={s.primaryText}>{index < (unit.vocabulary?.length ?? unit.grammar?.length ?? 0) - 1 ? '다음 항목' : '문제 풀기'}</Text></Pressable> : null}
      {stage === 'quiz' && selected !== null ? <Pressable onPress={nextQuestion} style={s.primaryButton} accessibilityRole="button"><Text style={s.primaryText}>{index < questions.length - 1 ? '다음 문제' : '결과 보기'}</Text></Pressable> : null}
      {stage === 'result' && unit ? <View style={s.resultButtons}><Pressable onPress={() => start(unit)} style={s.secondaryButton} accessibilityRole="button"><Text style={s.secondaryText}>다시 풀기</Text></Pressable><Pressable onPress={() => { setStage('units'); setUnit(null); }} style={[s.primaryButton, s.flex]} accessibilityRole="button"><Text style={s.primaryText}>다른 단원 보기</Text></Pressable></View> : null}
    </View> : null}
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, flex: { flex: 1 }, scroll: { flexGrow: 1, paddingBottom: 24 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }, back: { width: 40, height: 40, justifyContent: 'center' }, backText: { color: colors.ink, fontSize: 32, lineHeight: 36 }, headerTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 16 },
  hero: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 19, padding: 20 }, eyebrow: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, heroTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 20, marginTop: 7 }, heroText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 21, marginTop: 9 }, heroProgress: { color: colors.green, fontFamily: fonts.semi, fontSize: 12, marginTop: 15 }, sectionTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 17, marginTop: 23, marginBottom: 12 },
  unitCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 15, marginBottom: 10 }, unitNumber: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }, unitNumberText: { color: colors.pink, fontFamily: fonts.number, fontSize: 13 }, unitTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 14 }, unitDescription: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 3 }, unitMeta: { color: colors.pink, fontFamily: fonts.medium, fontSize: 10, marginTop: 7 }, chevron: { color: colors.pink, fontSize: 24 }, note: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 17, marginTop: 8 },
  bankLevels: { flexDirection: 'row', gap: 8, marginBottom: 10 }, bankLevel: { flex: 1, alignItems: 'center', paddingVertical: 11, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10 }, bankLevelActive: { backgroundColor: colors.pale, borderColor: colors.pink }, bankLevelText: { color: colors.muted, fontFamily: fonts.semi, fontSize: 11 }, bankLevelTextActive: { color: colors.pink }, bankCount: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginBottom: 13 }, bankPager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }, bankPagerButton: { padding: 12 }, bankPagerText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 12 }, bankPageText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, stepLabel: { color: colors.pink, fontFamily: fonts.bold, fontSize: 12 }, stepCount: { color: colors.muted, fontFamily: fonts.number, fontSize: 12 }, track: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden', marginTop: 11, marginBottom: 20 }, trackFill: { height: 6, backgroundColor: colors.pink },
  learnCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 19, paddingHorizontal: 22, paddingVertical: 25 }, cardLabel: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, learnMain: { color: colors.ink, fontFamily: fonts.jpBold, fontSize: 32, marginTop: 12 }, learnReading: { color: colors.pink, fontFamily: fonts.jp, fontSize: 21, marginTop: 4 }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 20 }, learnMeaning: { color: colors.ink, fontFamily: fonts.bold, fontSize: 19, marginTop: 8 }, learnExplanation: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 8 }, exampleCard: { backgroundColor: '#F2F1F8', borderRadius: 14, padding: 17, marginTop: 14 }, exampleJapanese: { color: colors.ink, fontFamily: fonts.jp, fontSize: 16, lineHeight: 28, marginTop: 7 }, exampleKorean: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 5 },
  sourceCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 17, marginBottom: 14 }, sourceText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 14, lineHeight: 26, marginTop: 10 }, audioIntro: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, marginTop: 8 }, audioButton: { backgroundColor: colors.pale, borderRadius: 10, alignItems: 'center', padding: 13, marginTop: 12 }, audioButtonText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13 }, transcriptLabel: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11, marginTop: 16 },
  questionCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 18 }, questionType: { color: colors.pink, fontFamily: fonts.bold, fontSize: 11 }, questionText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 17, lineHeight: 27, marginTop: 8 }, choices: { marginTop: 14, gap: 9 }, choice: { minHeight: 52, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 9 }, choiceCorrect: { borderColor: colors.green, backgroundColor: colors.greenPale }, choiceWrong: { borderColor: colors.pink, backgroundColor: colors.pale }, choiceText: { color: colors.ink, fontFamily: fonts.jp, fontSize: 14, lineHeight: 21 }, feedback: { borderRadius: 11, padding: 14, marginTop: 14 }, feedbackCorrect: { backgroundColor: colors.greenPale }, feedbackWrong: { backgroundColor: colors.pale }, feedbackTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 13 }, feedbackDetail: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 6 }, scriptButton: { alignSelf: 'flex-start', paddingVertical: 12 }, scriptButtonText: { color: colors.pink, fontFamily: fonts.semi, fontSize: 12 },
  resultCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, alignItems: 'center', padding: 25, marginTop: 15 }, resultSymbol: { color: colors.green, fontSize: 36 }, resultTitle: { color: colors.ink, fontFamily: fonts.bold, fontSize: 19, marginTop: 8 }, resultScore: { color: colors.pink, fontFamily: fonts.number, fontSize: 23, marginTop: 9 }, resultText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, textAlign: 'center', marginTop: 12 }, error: { color: colors.pink, fontFamily: fonts.medium, fontSize: 11, lineHeight: 18, marginTop: 12 },
  bottom: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 18, paddingVertical: 10 }, primaryButton: { width: '100%', maxWidth: 640, alignSelf: 'center', height: 49, backgroundColor: colors.pink, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 }, resultButtons: { width: '100%', maxWidth: 640, alignSelf: 'center', flexDirection: 'row', gap: 9 }, secondaryButton: { height: 49, paddingHorizontal: 18, borderWidth: 1, borderColor: colors.pink, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: colors.pink, fontFamily: fonts.bold, fontSize: 13 },
});
