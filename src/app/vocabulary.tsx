import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/header-back-button';
import { n5VocabularyUnits, type VocabularyUnit } from '@/content/vocabulary';
import { getCompletedVocabularyUnits, saveCompletedVocabularyUnit } from '@/storage/vocabulary-progress';

type Stage = 'units' | 'learn' | 'quiz' | 'result';

const c = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', pale: '#FFF0F4', green: '#087F5B', greenPale: '#E5F8EF', line: '#ECE9F0' };
const f = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_700Bold', number: 'PlusJakartaSans_700Bold' };

export default function VocabularyScreen() {
  const [stage, setStage] = useState<Stage>('units');
  const [unit, setUnit] = useState<VocabularyUnit | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    getCompletedVocabularyUnits().then(setCompletedIds).catch(() => setSaveError(true));
  }, []);

  function startUnit(nextUnit: VocabularyUnit) {
    setUnit(nextUnit);
    setIndex(0);
    setAnswer(null);
    setCorrectCount(0);
    setSaveError(false);
    setStage('learn');
  }

  function startQuiz() {
    setIndex(0);
    setAnswer(null);
    setCorrectCount(0);
    setStage('quiz');
  }

  async function nextQuestion() {
    if (!unit || answer === null) return;
    const word = unit.words[index];
    const expected = index % 2 === 0 ? word.meaning : word.reading;
    const score = correctCount + Number(answer === expected);
    setCorrectCount(score);
    setAnswer(null);
    if (index < unit.words.length - 1) {
      setIndex(index + 1);
      return;
    }
    setStage('result');
    if (score === unit.words.length) {
      try {
        setCompletedIds(await saveCompletedVocabularyUnit(unit.id));
      } catch {
        setSaveError(true);
      }
    }
  }

  const currentWord = unit?.words[index];
  const isReadingQuestion = index % 2 === 1;
  const expected = currentWord ? (isReadingQuestion ? currentWord.reading : currentWord.meaning) : '';
  const choices = unit ? unit.words.map((word) => isReadingQuestion ? word.reading : word.meaning) : [];
  const offset = [2, 1, 3, 2][index] ?? 0;
  const visibleChoices = [...choices.slice(offset), ...choices.slice(0, offset)];
  const isPerfect = !!unit && correctCount === unit.words.length;

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}>
      <HeaderBackButton onPress={() => stage === 'units' ? router.back() : setStage('units')} />
      <Text style={s.headerTitle}>N5 문자·어휘</Text>
      <View style={s.headerSpacer} />
    </View>

    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        {stage === 'units' ? <>
          <View style={s.hero}><Text style={s.eyebrow}>첫걸음 학습</Text><Text style={s.heroTitle}>단어를 읽고, 뜻을 익혀요</Text><Text style={s.heroText}>일상에서 자주 쓰는 표현 12개를 3개 단원으로 나눴어요. 각 단원의 단어를 살펴본 뒤 읽기와 뜻을 확인해 보세요.</Text><Text style={s.heroProgress}>{completedIds.filter((id) => n5VocabularyUnits.some((item) => item.id === id)).length} / {n5VocabularyUnits.length} 단원 완료</Text></View>
          <Text style={s.sectionTitle}>학습 단원</Text>
          {n5VocabularyUnits.map((item, unitIndex) => {
            const completed = completedIds.includes(item.id);
            return <Pressable key={item.id} onPress={() => startUnit(item)} style={s.unitCard} accessibilityRole="button" accessibilityLabel={`${item.title}, ${completed ? '완료' : '학습 시작'}`}>
              <View style={s.unitNumber}><Text style={s.unitNumberText}>{String(unitIndex + 1).padStart(2, '0')}</Text></View>
              <View style={s.flex}><Text style={s.unitTitle}>{item.title}</Text><Text style={s.unitDescription}>{item.description}</Text><Text style={s.unitMeta}>{item.words.length}개 단어 · 읽기와 뜻 퀴즈</Text></View>
              <Text style={completed ? s.completed : s.chevron}>{completed ? '완료' : '›'}</Text>
            </Pressable>;
          })}
          <Text style={s.note}>이 자료는 입문 학습용 예시이며 JLPT 공식 지정 어휘 목록은 아닙니다.</Text>
        </> : null}

        {stage === 'learn' && unit && currentWord ? <>
          <View style={s.stepRow}><Text style={s.stepLabel}>{unit.title} · 단어 학습</Text><Text style={s.stepCount}>{index + 1} / {unit.words.length}</Text></View>
          <View style={s.track}><View style={[s.trackFill, { width: `${((index + 1) / unit.words.length) * 100}%` }]} /></View>
          <View style={s.wordCard}><Text style={s.wordHint}>한자와 읽기</Text><Text style={s.wordWritten}>{currentWord.written}</Text><Text style={s.wordReading}>{currentWord.reading}</Text><View style={s.divider} /><Text style={s.wordHint}>뜻</Text><Text style={s.wordMeaning}>{currentWord.meaning}</Text></View>
          <View style={s.exampleCard}><Text style={s.exampleLabel}>예문</Text><Text style={s.exampleJapanese}>{currentWord.example}</Text><Text style={s.exampleKorean}>{currentWord.translation}</Text></View>
        </> : null}

        {stage === 'quiz' && unit && currentWord ? <>
          <View style={s.stepRow}><Text style={s.stepLabel}>{unit.title} · 확인 퀴즈</Text><Text style={s.stepCount}>{index + 1} / {unit.words.length}</Text></View>
          <View style={s.track}><View style={[s.trackFill, { width: `${((index + 1) / unit.words.length) * 100}%` }]} /></View>
          <View style={s.questionCard}><Text style={s.questionType}>{isReadingQuestion ? '읽기 고르기' : '뜻 고르기'}</Text><Text style={s.questionText}>「{currentWord.written}」{isReadingQuestion ? '의 읽기는?' : '의 뜻은?'}</Text><Text style={s.questionNote}>알맞은 답을 하나 선택하세요.</Text></View>
          <View style={s.choices}>{visibleChoices.map((choice) => {
            const chosen = answer === choice;
            const revealed = answer !== null;
            return <Pressable key={choice} disabled={revealed} onPress={() => setAnswer(choice)} style={[s.choice, revealed && choice === expected && s.choiceCorrect, chosen && choice !== expected && s.choiceWrong]} accessibilityRole="button" accessibilityLabel={choice}>
              <Text style={[s.choiceText, revealed && choice === expected && s.choiceTextCorrect, chosen && choice !== expected && s.choiceTextWrong]}>{choice}</Text>
            </Pressable>;
          })}</View>
          {answer !== null ? <View style={[s.feedback, answer === expected ? s.feedbackCorrect : s.feedbackWrong]}><Text style={s.feedbackText}>{answer === expected ? '정답이에요!' : `정답은 ${expected}입니다.`}</Text><Text style={s.feedbackDetail}>{currentWord.written} · {currentWord.reading} · {currentWord.meaning}</Text></View> : null}
        </> : null}

        {stage === 'result' && unit ? <View style={s.resultCard}>
          <Text style={s.resultEmoji}>{isPerfect ? '✓' : '↻'}</Text><Text style={s.resultTitle}>{isPerfect ? '단원을 완료했어요!' : '한 번 더 연습해 볼까요?'}</Text>
          <Text style={s.resultScore}>{correctCount} / {unit.words.length} 정답</Text>
          <Text style={s.resultText}>{isPerfect ? `${unit.title}의 단어를 모두 맞혔어요. 다른 단원도 이어서 공부해 보세요.` : '틀린 단어를 다시 살펴보고 퀴즈에 도전해 보세요. 모두 맞히면 완료로 기록됩니다.'}</Text>
        </View> : null}
        {saveError ? <Text style={s.error}>학습 기록을 저장하거나 불러오지 못했습니다. 기기 저장 공간을 확인해 주세요.</Text> : null}
      </View>
    </ScrollView>

    {stage !== 'units' ? <View style={s.bottom}>
      {stage === 'learn' && unit ? <Pressable style={s.primaryButton} onPress={() => index < unit.words.length - 1 ? setIndex(index + 1) : startQuiz()} accessibilityRole="button"><Text style={s.primaryText}>{index < unit.words.length - 1 ? '다음 단어' : '퀴즈 시작하기'}</Text></Pressable> : null}
      {stage === 'quiz' && unit && answer !== null ? <Pressable style={s.primaryButton} onPress={nextQuestion} accessibilityRole="button"><Text style={s.primaryText}>{index < unit.words.length - 1 ? '다음 문제' : '결과 보기'}</Text></Pressable> : null}
      {stage === 'result' && unit ? <Pressable style={s.primaryButton} onPress={() => isPerfect ? setStage('units') : startUnit(unit)} accessibilityRole="button"><Text style={s.primaryText}>{isPerfect ? '다른 단원 보기' : '단어 다시 보기'}</Text></Pressable> : null}
    </View> : null}
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg }, header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.line }, headerTitle: { color: c.ink, fontFamily: f.bold, fontSize: 16 }, headerSpacer: { width: 40 },
  scroll: { flexGrow: 1, paddingBottom: 24 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 20 }, flex: { flex: 1 },
  hero: { backgroundColor: c.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 19, padding: 20 }, eyebrow: { color: c.pink, fontFamily: f.bold, fontSize: 11 }, heroTitle: { color: c.ink, fontFamily: f.bold, fontSize: 20, marginTop: 7 }, heroText: { color: c.muted, fontFamily: f.body, fontSize: 12, lineHeight: 21, marginTop: 9 }, heroProgress: { color: c.green, fontFamily: f.semi, fontSize: 12, marginTop: 15 }, sectionTitle: { color: c.ink, fontFamily: f.bold, fontSize: 17, marginTop: 23, marginBottom: 12 },
  unitCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 15, marginBottom: 10 }, unitNumber: { width: 38, height: 38, borderRadius: 11, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' }, unitNumberText: { color: c.pink, fontFamily: f.number, fontSize: 13 }, unitTitle: { color: c.ink, fontFamily: f.bold, fontSize: 14 }, unitDescription: { color: c.muted, fontFamily: f.body, fontSize: 11, marginTop: 3 }, unitMeta: { color: c.pink, fontFamily: f.medium, fontSize: 10, marginTop: 7 }, completed: { color: c.green, fontFamily: f.bold, fontSize: 11 }, chevron: { color: c.pink, fontSize: 24 }, note: { color: c.muted, fontFamily: f.body, fontSize: 10, lineHeight: 17, marginTop: 7 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, stepLabel: { color: c.pink, fontFamily: f.bold, fontSize: 12 }, stepCount: { color: c.muted, fontFamily: f.number, fontSize: 12 }, track: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden', marginTop: 11, marginBottom: 20 }, trackFill: { height: 6, backgroundColor: c.pink, borderRadius: 4 },
  wordCard: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 19, alignItems: 'center', paddingHorizontal: 22, paddingVertical: 28 }, wordHint: { color: c.muted, fontFamily: f.semi, fontSize: 11 }, wordWritten: { color: c.ink, fontFamily: f.jp, fontSize: 46, marginTop: 12 }, wordReading: { color: c.pink, fontFamily: f.jp, fontSize: 21, marginTop: 4 }, divider: { width: '100%', height: 1, backgroundColor: c.line, marginVertical: 22 }, wordMeaning: { color: c.ink, fontFamily: f.bold, fontSize: 21, marginTop: 9 }, exampleCard: { backgroundColor: '#F2F1F8', borderRadius: 14, padding: 17, marginTop: 14 }, exampleLabel: { color: c.pink, fontFamily: f.bold, fontSize: 11 }, exampleJapanese: { color: c.ink, fontFamily: f.jp, fontSize: 16, lineHeight: 27, marginTop: 7 }, exampleKorean: { color: c.muted, fontFamily: f.body, fontSize: 12, marginTop: 5 },
  questionCard: { backgroundColor: c.white, borderRadius: 17, padding: 21, borderWidth: 1, borderColor: c.line }, questionType: { color: c.pink, fontFamily: f.bold, fontSize: 11 }, questionText: { color: c.ink, fontFamily: f.bold, fontSize: 20, marginTop: 12 }, questionNote: { color: c.muted, fontFamily: f.body, fontSize: 12, marginTop: 9 }, choices: { marginTop: 16, gap: 10 }, choice: { minHeight: 54, borderWidth: 1, borderColor: c.line, backgroundColor: c.white, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 17 }, choiceCorrect: { borderColor: c.green, backgroundColor: c.greenPale }, choiceWrong: { borderColor: c.pink, backgroundColor: c.pale }, choiceText: { color: c.ink, fontFamily: f.semi, fontSize: 15 }, choiceTextCorrect: { color: c.green }, choiceTextWrong: { color: c.pink }, feedback: { borderRadius: 12, padding: 14, marginTop: 16 }, feedbackCorrect: { backgroundColor: c.greenPale }, feedbackWrong: { backgroundColor: c.pale }, feedbackText: { color: c.ink, fontFamily: f.bold, fontSize: 13 }, feedbackDetail: { color: c.muted, fontFamily: f.medium, fontSize: 11, marginTop: 5 },
  resultCard: { backgroundColor: c.white, borderWidth: 1, borderColor: c.line, borderRadius: 18, alignItems: 'center', padding: 25, marginTop: 15 }, resultEmoji: { color: c.green, fontSize: 36 }, resultTitle: { color: c.ink, fontFamily: f.bold, fontSize: 19, marginTop: 8 }, resultScore: { color: c.pink, fontFamily: f.number, fontSize: 23, marginTop: 9 }, resultText: { color: c.muted, fontFamily: f.body, fontSize: 12, lineHeight: 20, textAlign: 'center', marginTop: 12 }, error: { color: c.pink, fontFamily: f.medium, fontSize: 11, marginTop: 14 },
  bottom: { backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.line, paddingHorizontal: 18, paddingVertical: 10 }, primaryButton: { width: '100%', maxWidth: 640, alignSelf: 'center', height: 49, backgroundColor: c.pink, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, primaryText: { color: c.white, fontFamily: f.bold, fontSize: 14 },
});
