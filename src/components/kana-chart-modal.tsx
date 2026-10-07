import * as Speech from 'expo-speech';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { kanaCharacter, kanaRows, type KanaEntry, type KanaGroup } from '@/content/kana-chart';

type Script = 'hiragana' | 'katakana';
const colors = { ink: '#202225', muted: '#685F61', rose: '#B90538', pink: '#F43F5E', pale: '#FFF1F3', line: '#EADCDD', canvas: '#FAF9F6' };
const font = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_700Bold', number: 'PlusJakartaSans_600SemiBold' };
const groups: { key: KanaGroup; label: string }[] = [
  { key: 'basic', label: '청음 · 기본 46자' },
  { key: 'voiced', label: '탁음 · 반탁음' },
  { key: 'contracted', label: '요음' },
];
const quiz: KanaEntry[] = [kanaRows.basic[0][0], kanaRows.basic[1][1], kanaRows.basic[2][2], kanaRows.basic[3][2], kanaRows.basic[5][4]].filter((item): item is KanaEntry => item !== null);
const quizChoices = [
  ['아', '오', '에', '우'],
  ['카', '키', '쿠', '케'],
  ['사', '시', '스', '세'],
  ['치', '타', '츠', '테'],
  ['하', '히', '헤', '호'],
];

export function KanaChartModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { bottom } = useSafeAreaInsets();
  const speechRequest = useRef(0);
  const [script, setScript] = useState<Script>('hiragana');
  const [group, setGroup] = useState<KanaGroup>('basic');
  const [showHangul, setShowHangul] = useState(true);
  const [speechError, setSpeechError] = useState(false);
  const [quizIndex, setQuizIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  function close() {
    speechRequest.current += 1;
    void Speech.stop().catch(() => {});
    setQuizIndex(null);
    setSelected(null);
    onClose();
  }

  async function speak(item: KanaEntry) {
    const request = ++speechRequest.current;
    setSpeechError(false);
    try {
      await Speech.stop();
      if (request !== speechRequest.current) return;
      Speech.speak(kanaCharacter(item.hiragana, script), { language: 'ja-JP', rate: 0.85, onError: () => { if (request === speechRequest.current) setSpeechError(true); } });
    } catch {
      if (request === speechRequest.current) setSpeechError(true);
    }
  }

  function choose(answer: string) {
    if (selected !== null || quizIndex === null || quizIndex >= quiz.length) return;
    setSelected(answer);
    if (answer === quiz[quizIndex].hangul) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (quizIndex === null || selected === null) return;
    setQuizIndex(quizIndex + 1);
    setSelected(null);
  }

  const heading = group === 'basic' ? ['あ단 (a)', 'い단 (i)', 'う단 (u)', 'え단 (e)', 'お단 (o)'] : group === 'contracted' ? ['ゃ (ya)', 'ゅ (yu)', 'ょ (yo)'] : ['a', 'i', 'u', 'e', 'o'];

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
    <View style={s.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="50음도 발음표 닫기" />
      <View style={s.sheet}>
        <View style={s.handle} />
        <View style={s.header}>
          <View style={s.fill}>
            <Text style={s.badge}>✦ 입문 필수 · 발음 기호 완벽 정복</Text>
            <Text style={s.title}>히라가나 · 가타카나 50음도표</Text>
            <Text style={s.subtitle}>일본어의 기본 청음 46자와 한글 발음, 로마자 표기 및 음성을 확인하세요.</Text>
          </View>
          <Pressable onPress={close} style={s.close} accessibilityRole="button" accessibilityLabel="발음표 닫기"><Text style={s.closeText}>×</Text></Pressable>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {quizIndex === null ? <>
            <View style={s.tabRow}>{(['hiragana', 'katakana'] as const).map((item) => <Pressable key={item} onPress={() => setScript(item)} style={[s.tab, script === item && s.tabActive]} accessibilityRole="tab" accessibilityState={{ selected: script === item }}><Text style={[s.tabText, script === item && s.tabTextActive]}>{item === 'hiragana' ? '히라가나 (平仮名)' : '가타카나 (片仮名)'}</Text></Pressable>)}</View>
            <Pressable onPress={() => setShowHangul((value) => !value)} style={s.hangulToggle} accessibilityRole="switch" accessibilityState={{ checked: showHangul }}><Text style={s.hangulToggleText}>{showHangul ? '✓ 한글 발음 켜짐' : '한글 발음 꺼짐'}</Text></Pressable>
            <View style={s.groupRow}>{groups.map((item) => <Pressable key={item.key} onPress={() => setGroup(item.key)} style={[s.groupChip, group === item.key && s.groupChipActive]} accessibilityRole="button" accessibilityState={{ selected: group === item.key }}><Text style={[s.groupText, group === item.key && s.groupTextActive]}>{item.label}</Text></Pressable>)}</View>
            <View style={s.chart}>
              <View style={s.chartRow}>{heading.map((label) => <Text key={label} style={s.columnTitle}>{script === 'katakana' ? label.replace(/[あいうえおゃゅょ]/g, (letter) => kanaCharacter(letter, 'katakana')) : label}</Text>)}</View>
              {kanaRows[group].map((row, rowIndex) => <View key={`${group}-${rowIndex}`} style={s.chartRow}>{row.map((item, columnIndex) => item ? <Pressable key={item.hiragana} onPress={() => { void speak(item); }} style={s.kanaTile} accessibilityRole="button" accessibilityLabel={`${kanaCharacter(item.hiragana, script)} ${item.romaji}${showHangul ? ` ${item.hangul}` : ''} 발음 듣기`}><Text style={s.speaker}>◖))</Text><Text style={s.kana}>{kanaCharacter(item.hiragana, script)}</Text><Text style={s.romaji}>{item.romaji}</Text>{showHangul ? <Text style={s.hangul}>{item.hangul}</Text> : null}</Pressable> : <View key={`empty-${rowIndex}-${columnIndex}`} style={s.emptyTile} />)}</View>)}
            </View>
            {speechError ? <Text style={s.error}>음성을 재생하지 못했습니다. 기기의 일본어 음성 설정을 확인해 주세요.</Text> : null}
            <View style={s.tipCard}><Text style={s.tipTitle}>💡 한국인이 헷갈리기 쉬운 발음 닥터 팁</Text><Text style={s.tipText}><Text style={s.tipStrong}>つ(tsu)와 す(su)</Text>{'\n'}つ는 ‘츠’, す는 ‘스’에 가깝습니다. 한글 표기는 참고용으로 보고 실제 소리를 반복해 들어 보세요.</Text><Text style={s.tipText}><Text style={s.tipStrong}>ざ(za)와 じ(ji)</Text>{'\n'}ざ행은 성대가 울리는 소리입니다. 청음 さ행과 번갈아 들으며 차이를 익혀 보세요.</Text></View>
            <Text style={s.audioNote}>각 글자를 누르면 기기의 일본어 음성으로 발음을 들을 수 있습니다.</Text>
          </> : quizIndex < quiz.length ? <View style={s.quizCard}>
            <Text style={s.quizStep}>발음 퀴즈 · {quizIndex + 1} / {quiz.length}</Text>
            <Text style={s.quizQuestion}>이 글자는 어떻게 읽을까요?</Text>
            <Pressable onPress={() => { void speak(quiz[quizIndex]); }} style={s.quizKanaButton} accessibilityRole="button" accessibilityLabel="문제 글자 발음 듣기"><Text style={s.quizKana}>{kanaCharacter(quiz[quizIndex].hiragana, script)}</Text><Text style={s.quizListen}>◖)) 발음 듣기</Text></Pressable>
            <View style={s.choices}>{quizChoices[quizIndex].map((answer) => <Pressable key={answer} onPress={() => choose(answer)} style={[s.choice, selected === answer && (answer === quiz[quizIndex].hangul ? s.choiceCorrect : s.choiceWrong)]} accessibilityRole="button"><Text style={s.choiceText}>{answer}</Text></Pressable>)}</View>
            {selected !== null ? <Text style={s.feedback}>{selected === quiz[quizIndex].hangul ? '정답입니다!' : `정답은 ${quiz[quizIndex].hangul}입니다.`}</Text> : null}
          </View> : <View style={s.quizCard}><Text style={s.resultIcon}>✓</Text><Text style={s.resultTitle}>발음 퀴즈 완료</Text><Text style={s.resultScore}>{score} / {quiz.length} 정답</Text><Text style={s.resultDetail}>틀린 글자는 발음표에서 다시 듣고 연습해 보세요.</Text></View>}
        </ScrollView>
        <View style={[s.footer, { paddingBottom: Math.max(bottom, 16) }]}>{quizIndex === null ? <Pressable onPress={() => { setScore(0); setSelected(null); setQuizIndex(0); }} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>▣ 50음도 발음 퀴즈 풀기</Text></Pressable> : quizIndex < quiz.length ? <Pressable onPress={nextQuestion} disabled={selected === null} style={[s.primary, selected === null && s.primaryDisabled]} accessibilityRole="button"><Text style={s.primaryText}>{quizIndex === quiz.length - 1 ? '결과 보기' : '다음 문제'}</Text></Pressable> : <Pressable onPress={() => setQuizIndex(null)} style={s.primary} accessibilityRole="button"><Text style={s.primaryText}>발음표로 돌아가기</Text></Pressable>}</View>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(31,35,45,0.62)' },
  sheet: { width: '100%', maxWidth: 440, maxHeight: '94%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', elevation: 18 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E9C6CC', alignSelf: 'center', marginTop: 10, marginBottom: 7 },
  header: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingTop: 7, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
  fill: { flex: 1 }, badge: { alignSelf: 'flex-start', color: colors.rose, backgroundColor: '#FFDDE2', overflow: 'hidden', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontFamily: font.bold, fontSize: 10 },
  title: { color: colors.ink, fontFamily: font.bold, fontSize: 18, lineHeight: 26, marginTop: 8 }, subtitle: { color: colors.muted, fontFamily: font.body, fontSize: 11, lineHeight: 17, marginTop: 4 },
  close: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }, closeText: { color: colors.muted, fontSize: 27, lineHeight: 30 },
  scroll: { flexShrink: 1 }, content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 13 },
  tabRow: { flexDirection: 'row', gap: 6, backgroundColor: '#F7F4F5', borderRadius: 11, padding: 4 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 }, tabActive: { backgroundColor: colors.rose }, tabText: { color: colors.muted, fontFamily: font.bold, fontSize: 11 }, tabTextActive: { color: '#FFFFFF' },
  hangulToggle: { alignSelf: 'flex-end', backgroundColor: '#EFF8F4', borderWidth: 1, borderColor: '#BDE3D2', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 6 }, hangulToggleText: { color: '#087F5B', fontFamily: font.bold, fontSize: 10 },
  groupRow: { flexDirection: 'row', gap: 5 }, groupChip: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F4F7', borderRadius: 15, paddingHorizontal: 3 }, groupChipActive: { backgroundColor: '#FFDDE2' }, groupText: { color: colors.muted, fontFamily: font.medium, fontSize: 9, textAlign: 'center' }, groupTextActive: { color: colors.rose, fontFamily: font.bold },
  chart: { gap: 6 }, chartRow: { flexDirection: 'row', gap: 5 }, columnTitle: { flex: 1, textAlign: 'center', color: colors.muted, backgroundColor: '#F9F7FA', borderRadius: 7, paddingVertical: 6, fontFamily: font.medium, fontSize: 9 },
  kanaTile: { flex: 1, minWidth: 0, minHeight: 88, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }, emptyTile: { flex: 1 }, speaker: { color: '#B1A6A9', position: 'absolute', top: 4, right: 4, fontSize: 8 }, kana: { color: colors.ink, fontFamily: font.jp, fontSize: 26, lineHeight: 35 }, romaji: { color: colors.muted, fontFamily: font.number, fontSize: 10 }, hangul: { color: colors.rose, fontFamily: font.bold, fontSize: 11, marginTop: 2 },
  error: { color: colors.rose, fontFamily: font.medium, fontSize: 11 }, tipCard: { backgroundColor: '#FFF8EC', borderWidth: 1, borderColor: '#F4DDB2', borderRadius: 13, padding: 13, gap: 9 }, tipTitle: { color: '#79511B', fontFamily: font.bold, fontSize: 12 }, tipText: { color: '#675B4B', fontFamily: font.body, fontSize: 11, lineHeight: 18 }, tipStrong: { color: '#79511B', fontFamily: font.bold }, audioNote: { color: colors.muted, fontFamily: font.body, fontSize: 10, textAlign: 'center' },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#FFFFFF' }, primary: { minHeight: 49, borderRadius: 13, backgroundColor: colors.rose, alignItems: 'center', justifyContent: 'center' }, primaryDisabled: { opacity: 0.4 }, primaryText: { color: '#FFFFFF', fontFamily: font.bold, fontSize: 14 },
  quizCard: { backgroundColor: colors.canvas, borderRadius: 16, padding: 18, alignItems: 'center', gap: 13, minHeight: 360 }, quizStep: { color: colors.rose, fontFamily: font.bold, fontSize: 12 }, quizQuestion: { color: colors.ink, fontFamily: font.bold, fontSize: 18 }, quizKanaButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 40, paddingVertical: 12 }, quizKana: { color: colors.ink, fontFamily: font.jp, fontSize: 64 }, quizListen: { color: colors.rose, fontFamily: font.medium, fontSize: 11 }, choices: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { width: '48%', minHeight: 48, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, choiceCorrect: { backgroundColor: '#E9F8EF', borderColor: '#0C8A59' }, choiceWrong: { backgroundColor: colors.pale, borderColor: colors.pink }, choiceText: { color: colors.ink, fontFamily: font.bold, fontSize: 15 }, feedback: { color: colors.rose, fontFamily: font.bold, fontSize: 13 }, resultIcon: { color: '#0C8A59', fontSize: 50 }, resultTitle: { color: colors.ink, fontFamily: font.bold, fontSize: 21 }, resultScore: { color: colors.rose, fontFamily: font.bold, fontSize: 18 }, resultDetail: { color: colors.muted, fontFamily: font.body, fontSize: 12, textAlign: 'center' },
});
