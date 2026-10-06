import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { n5VocabularyUnits } from '@/content/vocabulary';
import { getCompletedVocabularyUnits } from '@/storage/vocabulary-progress';

type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
type IconName = { android: AndroidSymbol; ios: SFSymbol };

const levels: Level[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const color = { bg: '#F7F7FB', white: '#FFFFFF', ink: '#201F24', muted: '#797681', pink: '#E82E5A', softPink: '#FFF0F4', green: '#087F5B', softGreen: '#E5F8EF', line: '#ECE9F0' };
const font = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', semi: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold', jp: 'NotoSansJP_700Bold', number: 'PlusJakartaSans_700Bold' };
const icons = {
  menu: { android: 'menu', ios: 'line.3.horizontal' }, down: { android: 'keyboard_arrow_down', ios: 'chevron.down' },
  book: { android: 'menu_book', ios: 'book' }, grammar: { android: 'auto_stories', ios: 'text.book.closed' },
  reading: { android: 'article', ios: 'doc.text' }, listening: { android: 'headphones', ios: 'headphones' },
  play: { android: 'play_arrow', ios: 'play.fill' }, close: { android: 'close', ios: 'xmark' },
  sparkle: { android: 'auto_awesome', ios: 'sparkles' }, info: { android: 'info', ios: 'info.circle' },
} satisfies Record<string, IconName>;
const areas = [
  { id: 'vocabulary', title: '문자·어휘', description: '한자 읽기와 필수 어휘를 익혀요', detail: '한자 읽기, 표기, 문맥에 맞는 어휘를 차례로 연습합니다.', icon: icons.book, tint: '#B90538', soft: '#FFF0F3' },
  { id: 'grammar', title: '문법', description: '문장의 흐름을 익히고 표현을 넓혀요', detail: '문법 형식과 문장 만들기, 비슷한 표현의 차이를 살펴봅니다.', icon: icons.grammar, tint: '#B90538', soft: '#FFF0F3' },
  { id: 'reading', title: '독해', description: '다양한 문장과 지문을 읽어요', detail: '짧은 글에서 시작해 긴 글의 핵심 정보까지 찾아봅니다.', icon: icons.reading, tint: '#586CBA', soft: '#F0F2FF' },
  { id: 'listening', title: '청해', description: '자연스러운 속도의 일본어를 들어요', detail: '대화의 목적과 상황을 듣고 핵심 내용을 파악합니다.', icon: icons.listening, tint: '#6D5BB4', soft: '#F4F0FF' },
] as const;

function Icon({ name, tint = color.ink, size = 18 }: { name: IconName; tint?: string; size?: number }) {
  return <SymbolView name={{ android: name.android, ios: name.ios, web: name.android }} tintColor={tint} size={size} />;
}

function ProgressTrack({ progress = 0 }: { progress?: number }) {
  return <View style={s.progressTrack} accessibilityLabel={`진도 ${progress}%`}><View style={[s.progressFill, { width: `${progress}%` }]} /></View>;
}

export default function CourseScreen() {
  const [level, setLevel] = useState<Level>('N5');
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<(typeof areas)[number]['id'] | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [completedVocabulary, setCompletedVocabulary] = useState<string[]>([]);
  const activeArea = areas.find((area) => area.id === selectedArea);
  const completedUnitCount = n5VocabularyUnits.filter((unit) => completedVocabulary.includes(unit.id)).length;
  const vocabularyProgress = Math.round((completedUnitCount / n5VocabularyUnits.length) * 100);
  const recommendedUnit = n5VocabularyUnits.find((unit) => !completedVocabulary.includes(unit.id)) ?? n5VocabularyUnits[0];
  const recommendedWord = recommendedUnit.words[0];
  const vocabularyDone = completedUnitCount === n5VocabularyUnits.length;

  useFocusEffect(useCallback(() => {
    let active = true;
    getCompletedVocabularyUnits().then((ids) => { if (active) setCompletedVocabulary(ids); }).catch(() => {});
    return () => { active = false; };
  }, []));

  return <SafeAreaView style={s.screen} edges={['top']}>
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.content}>
        <View style={s.header}>
          <View style={s.headerSide}><Icon name={icons.menu} size={19} /></View>
          <Text style={s.headerTitle}>학습 과정</Text>
          <View style={s.headerSide}>
            <Pressable style={s.levelButton} onPress={() => setLevelMenuOpen(!levelMenuOpen)} accessibilityRole="button" accessibilityLabel={`학습 레벨 ${level} 선택`}><Text style={s.levelButtonText}>{level}</Text><Icon name={icons.down} tint={color.pink} size={14} /></Pressable>
            {levelMenuOpen ? <View style={s.levelMenu}>{levels.map((item) => <Pressable key={item} onPress={() => { setLevel(item); setLevelMenuOpen(false); setSelectedArea(null); }} style={[s.levelOption, level === item && s.levelOptionActive]} accessibilityRole="button"><Text style={[s.levelOptionText, level === item && s.levelOptionTextActive]}>{item}</Text></Pressable>)}</View> : null}
          </View>
        </View>

        <View style={s.overview}>
          <View style={s.overviewTop}><View style={s.planIcon}><Text style={s.planIconText}>P</Text></View><View style={s.fill}><Text style={s.overviewTitle}>{level} 학습 과정</Text><Text style={s.overviewSubtitle}>나에게 맞는 순서로 차근차근 시작해요</Text></View><Text style={s.startBadge}>{level === 'N5' ? '문자·어휘 학습 가능' : '학습 준비 중'}</Text></View>
          <ProgressTrack progress={level === 'N5' ? vocabularyProgress : 0} /><View style={s.progressLabels}><Text style={s.progressNote}>{level === 'N5' ? `문자·어휘 ${completedUnitCount}/${n5VocabularyUnits.length}개 단원 완료` : '이 레벨의 학습 자료는 준비 중입니다'}</Text><Text style={s.progressNumber}>{level === 'N5' ? vocabularyProgress : 0}%</Text></View>
        </View>

        <View style={s.recommend}>
          <View style={s.recommendMeta}><Text style={s.recommendBadge}>{level === 'N5' ? '오늘의 추천 학습' : '학습 미리보기'}</Text><Text style={s.recommendLevel}>{level === 'N5' ? '문자·어휘' : '문법 예시'}</Text><Text style={s.recommendPreview}>{level === 'N5' ? `${recommendedUnit.words.length}개 단어` : '샘플 콘텐츠'}</Text></View>
          <Text style={s.recommendEyebrow}>{level === 'N5' ? `${recommendedUnit.title} · ${vocabularyDone ? '복습 단원' : '다음 단원'}` : '예시 표현 · 문법'}</Text><Text style={s.recommendJapanese}>{level === 'N5' ? `${recommendedWord.written} · ${recommendedWord.reading}` : '〜わけにはいかない'}</Text><Text style={s.recommendMeaning}>{level === 'N5' ? recommendedWord.meaning : '사회적 통념이나 의리상 ~할 수는 없다'}</Text>
          <View style={s.example}><Text style={s.exampleLabel}>대표 예문</Text><Text style={s.exampleJapanese}>{level === 'N5' ? recommendedWord.example : '休むわけにはいかない。'}</Text><Text style={s.exampleTranslation}>{level === 'N5' ? recommendedWord.translation : '쉴 수는 없다.'}</Text></View>
          <Text style={s.recommendDescription}>{level === 'N5' ? vocabularyDone ? '모든 단원을 완료했어요. 원하는 단원을 골라 다시 연습할 수 있어요.' : '단어를 살펴보고 읽기와 뜻 퀴즈로 확인해 보세요.' : '이 레벨의 실제 학습 자료는 준비 중입니다. 표현을 미리 살펴보세요.'}</Text>
          <Pressable style={s.recommendButton} onPress={() => level === 'N5' ? router.push('/vocabulary') : setLessonOpen(true)} accessibilityRole="button"><LinearGradient colors={['#F64E73', '#E82E5A', '#D91E4B']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.buttonGradient} /><Text style={s.recommendButtonText}>{level === 'N5' ? vocabularyDone ? '문자·어휘 다시 공부하기' : '문자·어휘 학습 시작' : '예시 학습 보기'}</Text><Icon name={icons.play} tint={color.white} size={18} /></Pressable>
        </View>

        <Text style={s.sectionTitle}>영역별 집중 학습</Text><Text style={s.sectionSubtitle}>원하는 영역을 눌러 학습 내용을 살펴보세요</Text>
        <View style={s.grid}>{areas.map((area) => <Pressable key={area.id} onPress={() => level === 'N5' && area.id === 'vocabulary' ? router.push('/vocabulary') : setSelectedArea(selectedArea === area.id ? null : area.id)} style={[s.areaCard, selectedArea === area.id && s.areaCardSelected]} accessibilityRole="button" accessibilityLabel={`${area.title} ${level === 'N5' && area.id === 'vocabulary' ? '학습 시작' : '학습 내용 보기'}`}>
          <View style={s.areaTop}><View style={[s.areaIcon, { backgroundColor: area.soft }]}><Icon name={area.icon} tint={area.tint} size={19} /></View><Text style={s.areaStatus}>{level === 'N5' && area.id === 'vocabulary' ? '학습 가능' : '준비 중'}</Text></View>
          <Text style={s.areaTitle}>{area.title}</Text><Text style={s.areaDescription}>{area.description}</Text><ProgressTrack progress={level === 'N5' && area.id === 'vocabulary' ? vocabularyProgress : 0} /><View style={s.areaBottom}><Text style={s.areaPercent}>{level === 'N5' && area.id === 'vocabulary' ? vocabularyProgress : 0}%</Text><Text style={s.areaPreview}>{level === 'N5' && area.id === 'vocabulary' ? '학습하기  ›' : '내용 보기  ›'}</Text></View>
        </Pressable>)}</View>
        {activeArea ? <View style={s.areaDetail}><View style={s.detailHeader}><Icon name={activeArea.icon} tint={activeArea.tint} size={19} /><Text style={s.detailTitle}>{activeArea.title} 학습 안내</Text><Pressable onPress={() => setSelectedArea(null)} accessibilityRole="button" accessibilityLabel="학습 안내 닫기"><Icon name={icons.close} tint={color.muted} size={18} /></Pressable></View><Text style={s.detailText}>{activeArea.detail}</Text><Text style={s.detailFootnote}>이 영역의 학습 콘텐츠는 준비 중입니다.</Text></View> : null}
        <View style={s.footer}><View style={s.footerIcon}><Icon name={icons.sparkle} tint={color.green} size={18} /></View><View style={s.fill}><Text style={s.footerTitle}>한 걸음씩, 꾸준히 이어가요</Text><Text style={s.footerText}>{level === 'N5' ? `문자·어휘 ${completedUnitCount}개 단원을 완료했어요. 단원을 눌러 언제든 복습할 수 있어요.` : '학습 자료가 추가되면 영역별 진도를 이곳에서 볼 수 있어요.'}</Text></View></View>
      </View>
    </ScrollView>
    <Modal visible={lessonOpen} animationType="slide" transparent onRequestClose={() => setLessonOpen(false)}><View style={s.modalBackdrop}><SafeAreaView style={s.modalSheet} edges={['bottom']}>
      <View style={s.modalHandle} /><View style={s.modalHeader}><View style={s.fill}><Text style={s.modalEyebrow}>문법 미리보기</Text><Text style={s.modalTitle}>〜わけにはいかない</Text></View><Pressable onPress={() => setLessonOpen(false)} style={s.modalClose} accessibilityRole="button" accessibilityLabel="미리보기 닫기"><Icon name={icons.close} size={21} /></Pressable></View>
      <ScrollView contentContainerStyle={s.modalBody}><Text style={s.modalLabel}>뜻</Text><Text style={s.modalMeaning}>사회적 통념이나 의리상 ~할 수는 없다</Text><Text style={s.modalExplanation}>능력이 없어서가 아니라, 책임이나 상황 때문에 어떤 행동을 할 수 없을 때 사용해요.</Text><View style={s.modalExample}><Text style={s.modalLabel}>예문</Text><Text style={s.modalJapanese}>明日は大事な会議があるから、休むわけにはいかない。</Text><Text style={s.modalTranslation}>내일은 중요한 회의가 있어서 쉴 수는 없다.</Text></View><View style={s.modalNotice}><Icon name={icons.info} tint={color.green} size={17} /><Text style={s.modalNoticeText}>이 화면은 학습 내용 미리보기입니다. 완료 기록은 저장되지 않습니다.</Text></View></ScrollView>
      <Pressable style={s.modalDone} onPress={() => setLessonOpen(false)} accessibilityRole="button"><Text style={s.modalDoneText}>확인했어요</Text></Pressable>
    </SafeAreaView></View></Modal>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg }, scroll: { flexGrow: 1, paddingBottom: 22 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 16 }, fill: { flex: 1 },
  header: { height: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }, headerSide: { width: 50, alignItems: 'flex-end' }, headerTitle: { color: color.ink, fontSize: 17, fontFamily: font.bold },
  levelButton: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FCE5EB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }, levelButtonText: { color: '#B90538', fontSize: 11, fontFamily: font.bold },
  levelMenu: { position: 'absolute', right: 0, top: 31, width: 80, backgroundColor: color.white, borderRadius: 12, borderWidth: 1, borderColor: color.line, padding: 4, elevation: 6, shadowColor: '#34242B', shadowOpacity: 0.12, shadowRadius: 8 }, levelOption: { paddingVertical: 8, alignItems: 'center', borderRadius: 8 }, levelOptionActive: { backgroundColor: color.softPink }, levelOptionText: { color: color.ink, fontSize: 12, fontFamily: font.medium }, levelOptionTextActive: { color: color.pink, fontFamily: font.bold },
  overview: { backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 15, padding: 14, marginBottom: 14 }, overviewTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 13 }, planIcon: { width: 28, height: 28, backgroundColor: color.green, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, planIconText: { color: color.white, fontFamily: font.number, fontSize: 13 }, overviewTitle: { color: color.ink, fontSize: 13, fontFamily: font.bold }, overviewSubtitle: { color: color.muted, fontSize: 10, fontFamily: font.body, marginTop: 2 }, startBadge: { color: color.green, fontSize: 10, fontFamily: font.semi, backgroundColor: color.softGreen, borderRadius: 12, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 }, progressTrack: { height: 6, backgroundColor: '#E8E9EB', borderRadius: 4, overflow: 'hidden' }, progressFill: { height: 6, backgroundColor: color.green, borderRadius: 4 }, progressLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 7 }, progressNote: { color: color.muted, fontSize: 10, fontFamily: font.body, flex: 1 }, progressNumber: { color: color.green, fontSize: 10, fontFamily: font.number },
  recommend: { backgroundColor: color.white, borderWidth: 1, borderColor: '#F4D9E0', borderRadius: 18, padding: 16, shadowColor: '#C42A51', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 }, recommendMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 }, recommendBadge: { color: color.white, backgroundColor: color.pink, borderRadius: 20, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontFamily: font.bold }, recommendLevel: { color: color.pink, backgroundColor: color.softPink, borderRadius: 12, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, fontFamily: font.semi }, recommendPreview: { color: color.muted, fontSize: 10, fontFamily: font.body, marginLeft: 'auto' }, recommendEyebrow: { color: color.pink, fontSize: 10, fontFamily: font.semi, marginTop: 12 }, recommendJapanese: { color: color.ink, fontSize: 23, lineHeight: 34, fontFamily: font.jp, marginTop: 1 }, recommendMeaning: { color: '#5F5B63', fontSize: 12, fontFamily: font.body, marginTop: 2 }, example: { backgroundColor: '#F4F3FA', borderRadius: 11, padding: 12, marginTop: 12 }, exampleLabel: { color: '#77727E', fontSize: 10, fontFamily: font.semi }, exampleJapanese: { color: color.ink, fontSize: 13, lineHeight: 22, fontFamily: font.jp, marginTop: 3 }, exampleTranslation: { color: color.muted, fontSize: 10, fontFamily: font.body, marginTop: 2 }, recommendDescription: { color: color.muted, fontSize: 10, lineHeight: 17, fontFamily: font.body, marginTop: 12 }, recommendButton: { height: 44, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 11 }, buttonGradient: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, recommendButtonText: { color: color.white, fontSize: 13, fontFamily: font.bold },
  sectionTitle: { color: color.ink, fontSize: 17, fontFamily: font.bold, marginTop: 20 }, sectionSubtitle: { color: color.muted, fontSize: 10, fontFamily: font.body, marginTop: 4, marginBottom: 11 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, areaCard: { width: '48%', flexGrow: 1, minWidth: 0, backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 14, padding: 13 }, areaCardSelected: { borderColor: color.pink }, areaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, areaIcon: { width: 29, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, areaStatus: { color: color.green, fontSize: 9, fontFamily: font.semi, backgroundColor: color.softGreen, borderRadius: 10, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 3 }, areaTitle: { color: color.ink, fontSize: 14, fontFamily: font.bold, marginTop: 11 }, areaDescription: { color: color.muted, fontSize: 10, lineHeight: 15, fontFamily: font.body, minHeight: 30, marginTop: 4, marginBottom: 9 }, areaBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }, areaPercent: { color: color.green, fontSize: 10, fontFamily: font.number }, areaPreview: { color: color.muted, fontSize: 9, fontFamily: font.medium }, areaDetail: { backgroundColor: color.white, borderWidth: 1, borderColor: '#F8D7E1', borderRadius: 13, padding: 14, marginTop: 10 }, detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 }, detailTitle: { flex: 1, color: color.ink, fontSize: 13, fontFamily: font.bold }, detailText: { color: '#5F5B63', fontSize: 11, lineHeight: 19, fontFamily: font.body, marginTop: 8 }, detailFootnote: { color: color.pink, fontSize: 10, fontFamily: font.medium, marginTop: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 13, padding: 12, marginTop: 13 }, footerIcon: { width: 28, height: 28, backgroundColor: color.softGreen, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, footerTitle: { color: color.ink, fontSize: 10, fontFamily: font.semi }, footerText: { color: color.muted, fontSize: 9, fontFamily: font.body, marginTop: 2 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(22, 17, 26, 0.48)' }, modalSheet: { backgroundColor: color.white, borderTopLeftRadius: 23, borderTopRightRadius: 23, maxHeight: '85%', paddingHorizontal: 20 }, modalHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#DCD8DF', marginTop: 10 }, modalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 18 }, modalEyebrow: { color: color.pink, fontSize: 11, fontFamily: font.semi }, modalTitle: { color: color.ink, fontSize: 21, fontFamily: font.jp, marginTop: 5 }, modalClose: { padding: 5 }, modalBody: { paddingVertical: 21 }, modalLabel: { color: color.pink, fontSize: 11, fontFamily: font.bold }, modalMeaning: { color: color.ink, fontSize: 15, fontFamily: font.semi, marginTop: 7 }, modalExplanation: { color: '#5F5B63', fontSize: 12, lineHeight: 21, fontFamily: font.body, marginTop: 9 }, modalExample: { backgroundColor: '#F4F3FA', borderRadius: 12, padding: 14, marginTop: 18 }, modalJapanese: { color: color.ink, fontSize: 14, lineHeight: 24, fontFamily: font.jp, marginTop: 8 }, modalTranslation: { color: color.muted, fontSize: 12, fontFamily: font.body, marginTop: 7 }, modalNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, backgroundColor: color.softGreen, padding: 12, borderRadius: 10, marginTop: 18 }, modalNoticeText: { color: color.green, fontSize: 11, lineHeight: 17, fontFamily: font.body, flex: 1 }, modalDone: { height: 48, backgroundColor: color.pink, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, modalDoneText: { color: color.white, fontSize: 13, fontFamily: font.bold },
});
