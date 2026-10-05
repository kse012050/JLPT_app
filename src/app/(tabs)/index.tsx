import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExamCalendarModal } from '@/components/exam-calendar-modal';
import { registrationStatus } from '@/constants/exam-schedule';

const color = {
  background: '#FAF9F6', surface: '#FFFFFF', ink: '#252622', muted: '#666963',
  navy: '#F02D5C', navySoft: '#FFE7EC', line: '#E8E6E2',
  coral: '#F43F5E', coralSoft: '#FFF2F4', green: '#586F5C', greenSoft: '#EEF3EC',
  amber: '#956213', amberSoft: '#FFF4E1',
};

const font = {
  body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium',
  semibold: 'NotoSansKR_600SemiBold', bold: 'NotoSansKR_700Bold',
  japanese: 'NotoSansJP_400Regular', japaneseBold: 'NotoSansJP_700Bold',
  number: 'PlusJakartaSans_600SemiBold', numberBold: 'PlusJakartaSans_700Bold',
};

type IconName = { android: AndroidSymbol; ios: SFSymbol };

function Icon({ name, tint = color.navy, size = 18 }: { name: IconName; tint?: string; size?: number }) {
  return <SymbolView name={{ android: name.android, web: name.android, ios: name.ios }} tintColor={tint} size={size} />;
}

const icons = {
  school: { android: 'school', ios: 'graduationcap' },
  flower: { android: 'local_florist', ios: 'camera.macro' },
  bell: { android: 'notifications', ios: 'bell' },
  flag: { android: 'flag', ios: 'flag' },
  guide: { android: 'menu_book', ios: 'book' },
  info: { android: 'info', ios: 'info.circle' },
  calendar: { android: 'calendar_month', ios: 'calendar' },
  arrow: { android: 'chevron_right', ios: 'chevron.right' },
  sparkle: { android: 'auto_awesome', ios: 'sparkles' },
  play: { android: 'play_arrow', ios: 'play.fill' },
  audio: { android: 'volume_up', ios: 'speaker.wave.2' },
  review: { android: 'style', ios: 'rectangle.on.rectangle' },
  check: { android: 'check', ios: 'checkmark' },
  checkCircle: { android: 'check_circle', ios: 'checkmark.circle' },
  lock: { android: 'lock', ios: 'lock' },
  bulb: { android: 'lightbulb', ios: 'lightbulb' },
  translate: { android: 'translate', ios: 'character.book.closed' },
  grammar: { android: 'auto_stories', ios: 'text.book.closed' },
  headphones: { android: 'headphones', ios: 'headphones' },
  quiz: { android: 'quiz', ios: 'questionmark.square' },
  close: { android: 'close', ios: 'xmark' },
  forward: { android: 'arrow_forward', ios: 'arrow.right' },
} satisfies Record<string, IconName>;

const examDay = new Date(2026, 11, 6);

function daysToExam() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.ceil((examDay.getTime() - today.getTime()) / 86400000));
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ title, detail, mobile = false }: { title: string; detail?: string; mobile?: boolean }) {
  return <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, mobile && styles.mobileSectionTitle]}>{title}</Text>{detail ? <Text style={[styles.sectionDetail, mobile && styles.mobileSectionDetail]}>{detail}</Text> : null}</View>;
}

function Header({ wide, days }: { wide: boolean; days: number }) {
  return (
    <View style={[styles.header, wide && styles.headerWide]}>
      <View style={[styles.brand, wide && styles.brandWide]}>
        {wide ? <Icon name={icons.school} tint={color.navy} size={21} /> : null}
        {wide ? <Icon name={icons.flower} tint={color.navy} size={23} /> : <View style={styles.mobileBrandIcon}><Icon name={icons.flower} tint={color.coral} size={20} /></View>}
        <Text style={[styles.brandText, !wide && styles.brandTextMobile]}>JLPT 완주</Text>
        {wide ? <View style={styles.coursePill}><View style={styles.courseDot} /><Text style={styles.courseText}>N3 실전 코스</Text></View> : null}
      </View>
      {wide ? <View style={styles.headerPlan}><Icon name={icons.flag} size={14} /><Text style={styles.headerPlanText}>초보자도 0부터 시작하는 JLPT 완성 플랜 · D-{days}</Text></View> : null}
      <View style={styles.headerActions}>
        {wide ? <Text style={styles.streak}>7일 연속 완주</Text> : <View style={styles.offline}><View style={styles.offlineDot} /><Text style={styles.offlineText}>오프라인 모드</Text></View>}
        {wide ? <Icon name={icons.bell} tint={color.muted} size={21} /> : <View style={styles.mobileBell}><Icon name={icons.bell} tint="#554245" size={20} /><View style={styles.notificationDot} /></View>}
      </View>
    </View>
  );
}

function MobileExam({ days, onGuide, onCalendar }: { days: number; onGuide: () => void; onCalendar: () => void }) {
  return (
    <Card style={styles.mobileExamCard}>
      <View style={styles.between}><View style={styles.planTag}><Icon name={icons.school} tint="#993850" size={14} /><Text style={styles.planTagText}>초보자도 0부터 시작하는 JLPT 완성 플랜</Text></View><Text style={styles.ddayPlain}>D-{days}</Text></View>
      <View style={styles.levelRow}><Text style={styles.levelTag}>N3</Text></View>
      <Text style={styles.examTitle}>2026년 제2회 JLPT N3 대비</Text>
      <View style={styles.examDivider} />
      <Pressable style={styles.guideBanner} onPress={onGuide} accessibilityRole="button">
        <View style={styles.guideIcon}><Icon name={icons.guide} tint="#1A1C1A" size={20} /></View>
        <View style={styles.fill}><Text style={styles.bannerTitle}>JLPT 시험 구성 1분 가이드</Text><Text style={styles.bannerDetail}>초보자 필독! 문자·문법·독해·청해 구조 한눈에 보기</Text></View>
        <Icon name={icons.arrow} size={18} />
      </Pressable>
      <View style={styles.dateBox}>
        <View style={styles.dateRow}><Text style={styles.dateText}>접수: 9.1~9.20 / 9.28~10.4  <Text style={styles.dateAccent}>({registrationStatus()})</Text></Text><Text style={styles.dateText}>시험일: 12.6(일)</Text></View>
        <Pressable style={styles.calendarButton} onPress={onCalendar} accessibilityRole="button"><Icon name={icons.calendar} size={15} /><Text style={styles.calendarButtonText}>전체 시험 & 학습 달력 보기</Text><Icon name={icons.arrow} size={14} /></Pressable>
      </View>
      <View style={styles.recommendation}><Icon name={icons.checkCircle} tint="#50644B" size={16} /><Text style={styles.recommendationText}><Text style={styles.recommendationLead}>오늘의 권장 학습량:</Text> 2개 수업 + 복습 15문항을 완료하면 합격 안정권에 도달합니다.</Text></View>
    </Card>
  );
}

const guideItems = [
  { title: '문자·어휘', time: '30분', detail: '한자 읽기·표기와 문맥 규정', tint: color.navy },
  { title: '문법 형식', time: '독해와 합쳐 70분', detail: '문맥에 맞는 문법 형식 판단', tint: color.coral },
  { title: '독해 지문', time: '문법과 합쳐 70분', detail: '단문·중문·장문과 정보 검색', tint: color.amber },
  { title: '청해 리스닝', time: '40분 / 60점', detail: '과제 이해와 즉각 응답', tint: color.green },
];

function GuideCard() {
  return <Card><SectionTitle title="초보자 1분 시험 가이드" detail="N3 기준 총 180점" /><Text style={styles.cardIntro}>과락 기준을 피하고 시간 배분을 익혀 보세요. 각 영역의 특징을 한눈에 확인할 수 있습니다.</Text><View style={styles.guideGrid}>{guideItems.map(item => <View key={item.title} style={styles.guideTile}><View style={styles.guideTileTop}><View style={[styles.tinyDot, { backgroundColor: item.tint }]} /><Text style={styles.guideTileTitle}>{item.title}</Text></View><Text style={styles.guideTime}>{item.time}</Text><Text style={styles.guideTileDetail}>{item.detail}</Text></View>)}</View></Card>;
}

function CalendarCard({ days }: { days: number }) {
  return <Card><SectionTitle title="2026 제2회 시험 일정" detail={`D-${days}`} /><View style={styles.calendarInfo}><View style={styles.between}><Text style={styles.mutedSmall}>일반접수</Text><Text style={styles.calendarValue}>9.1(화) ~ 9.20(일)</Text></View><View style={styles.hairline} /><View style={styles.between}><Text style={styles.mutedSmall}>추가접수</Text><Text style={styles.calendarValue}>9.28(월) ~ 10.4(일)</Text></View><View style={styles.hairline} /><View style={styles.between}><Text style={styles.mutedSmall}>제2회 본시험일</Text><Text style={styles.calendarValue}>12월 6일 (일)</Text></View></View><Text style={styles.mutedSmall}>수험표 출력: 10.26(월)부터 · 서울 실시위원회 기준</Text></Card>;
}

function Progress({ percent, coral = false, neutral = false, mobile = false }: { percent: number; coral?: boolean; neutral?: boolean; mobile?: boolean }) {
  return <View style={[styles.progressTrack, mobile && styles.mobileProgressTrack]}>{mobile && coral ? <LinearGradient colors={['#FF6384', '#F43F5E']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.progressFill, { width: `${percent}%` }]} /> : <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: neutral ? '#686D67' : coral ? color.coral : color.navy }]} />}</View>;
}

function LessonCard({ wide }: { wide: boolean }) {
  return <Card style={!wide ? styles.mobileLessonCard : undefined}>
    <View style={styles.between}><Text style={[styles.lessonTag, !wide && styles.mobileLessonTag]}>{wide ? '오늘의 추천 학습' : '학습 이어하기'}</Text><Text style={[styles.mutedSmall, !wide && styles.mobileLessonPercent]}>진행률 65%</Text></View>
    <Text style={[styles.lessonCaption, !wide && styles.mobileLessonCaption]}>{wide ? '[N3 문법 14강] 복합 표현' : '[N3 문법 14강]'}</Text>
    {wide ? <Text style={[styles.lessonTitle, styles.lessonTitleWide]}>〜わけにはいかない <Text style={styles.pronunciation}>(〜와케니와 이카나이)</Text></Text> : <View style={styles.mobileMeaning}><View style={styles.mobileGrammarRow}><Text style={styles.mobileGrammar}>〜わけにはいかない</Text><View style={styles.mobileAudioButton}><Icon name={icons.audio} tint={color.coral} size={15} /></View></View><Text style={styles.meaningText}>“사회적 통념이나 의리상 ~할 수는 없다”</Text></View>}
    {wide ? <><View style={styles.meaningBox}><Text style={styles.meaningText}>의미: 사회적 통념이나 의리상 ‘~할 수는 없다’</Text><Text style={styles.meaningDetail}>단순한 능력의 한계가 아닌, 상황이나 도덕적 이유로 할 수 없음을 나타냅니다.</Text></View><View style={styles.audioRow}><Icon name={icons.audio} tint={color.navy} size={20} /><View style={styles.fill}><Text style={styles.audioTitle}>원어민 표준 발음 & 대표 예문</Text><Text style={styles.audioExample}>明日は大事な会議があるから、休むわけにはいかない。</Text></View><Text style={styles.audioLength}>0:12</Text></View></> : null}
    {wide ? <View style={styles.progressLabel}><Text style={styles.mutedSmall}>강의 및 퀴즈 13/20 완료</Text><Text style={styles.percentText}>65%</Text></View> : null}
    <Progress percent={65} coral mobile={!wide} />
    <Pressable style={[styles.primaryButton, wide && styles.primaryButtonWide]} onPress={() => router.push('/course')} accessibilityRole="button">{wide ? null : <LinearGradient colors={['#FF6384', '#F43F5E', '#E11D48']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.mobileButtonGradient} />}<Text style={styles.primaryButtonText}>{wide ? '이어서 공부하기 (14강 3파트)' : '이어서 공부하기'}</Text><Icon name={icons.play} tint={color.surface} size={19} /></Pressable>
  </Card>;
}

function FlashCard({ title, meaning, label, detail, mobile = false }: { title: string; meaning: string; label: string; detail?: string; mobile?: boolean }) {
  return <Pressable style={[styles.flashCard, mobile && styles.mobileFlashCard]} onPress={() => router.push('/review')} accessibilityRole="button"><View style={styles.between}><Text style={[styles.flashLabel, mobile && styles.mobileFlashLabel, label === '3일차 복습' && styles.flashLabelGreen]}>{label}</Text>{mobile ? <Icon name={icons.review} tint="#887274" size={14} /> : null}</View><Text style={[styles.flashTitle, mobile && styles.mobileFlashTitle]}>{title}</Text><Text style={[styles.flashMeaning, mobile && styles.mobileFlashMeaning]}>{meaning}</Text>{detail ? <Text style={styles.flashDetail}>{detail}</Text> : null}</Pressable>;
}

function ReviewCard({ wide }: { wide: boolean }) {
  const body = <><View style={[styles.reviewAlert, wide && styles.reviewAlertWide]}>{wide ? null : <Icon name={icons.info} tint="#BA1A1A" size={16} />}<Text style={[styles.reviewAlertText, wide && styles.reviewAlertTextWide]}>{wide ? '망각 방지 골든타임! 3일 전 학습한 어휘를 지금 3분간 복습해 보세요.' : '어제 틀린 4문항이 포함되어 있습니다. 집중 점검하세요!'}</Text></View><View style={styles.flashGrid}><FlashCard title="雨が降る" meaning="비가 내리다" label={wide ? '단어 · 3회차' : '오답 복습'} detail={wide ? '예문: 午後から雨が降る予報だ。' : undefined} mobile={!wide} /><FlashCard title="〜にしては" meaning={wide ? '~치고는, ~에 비해서' : '~에 비해서'} label={wide ? '문법 · 1회차' : '3일차 복습'} detail={wide ? '예문: 初めて作った料理にしてはおいしい。' : undefined} mobile={!wide} /></View><Pressable style={[styles.secondaryButton, wide && styles.secondaryButtonWide]} onPress={() => router.push('/review')} accessibilityRole="button"><Icon name={icons.review} tint={color.coral} size={17} /><Text style={styles.secondaryButtonText}>12개 표현 3분 쾌속 플래시카드 시작</Text></Pressable></>;
  if (wide) return <Card><SectionTitle title="오늘의 복습 (망각곡선 최적 주기)" detail="복습 대상 12개" />{body}</Card>;
  return <View><View style={styles.sectionHeading}><View style={styles.reviewMobileHeading}><Text style={styles.sectionTitle}>오늘의 복습</Text><Text style={styles.reviewCount}>12</Text></View><Text style={styles.reviewMobileDetail}>망각곡선 주기 도래</Text></View><Card style={styles.mobileReviewCard}>{body}</Card></View>;
}

const roadmap = [
  { title: '입문 / 문자·발음', detail: '히라가나·가타카나 완전 정복', badge: '✓', progress: 100 },
  { title: 'N5 기초 다지기', detail: '기초 문법 40선 & 필수 한자 100자', badge: '✓', progress: 100 },
  { title: 'N4 실력 도약', detail: '기초 회화 어휘 & 조사 복합형', badge: 'N4', progress: 85 },
  { title: 'N3 실전 완성', detail: '중급 독해 & 일상 청해 마스터', badge: 'N3', progress: 42 },
  { title: 'N2 · N1 상급 코스', detail: '비즈니스 일본어 & 심화 독해', badge: '🔒', progress: 0 },
];

function RoadmapCard({ wide }: { wide: boolean }) {
  const body = <View style={[styles.roadmapList, !wide && styles.mobileRoadmapList]}>
    {roadmap.map(item => (
      <Pressable key={item.title} disabled={item.progress === 0} onPress={() => router.push('/course')} style={[styles.roadmapItem, !wide && styles.mobileRoadmapItem, item.badge === 'N3' && styles.roadmapActive, item.progress === 0 && styles.roadmapLocked, !wide && item.progress === 0 && styles.mobileRoadmapLocked]}>
        {!wide && item.badge === 'N3' ? <LinearGradient colors={['#FF6384', '#F43F5E']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={[styles.roadmapBadge, styles.mobileRoadmapBadge]}><Text style={[styles.roadmapBadgeText, styles.roadmapBadgeTextActive]}>{item.badge}</Text></LinearGradient> : <View style={[styles.roadmapBadge, !wide && styles.mobileRoadmapBadge, item.badge === 'N4' && styles.roadmapBadgeN4, item.badge === 'N3' && styles.roadmapBadgeActive]}><Text style={[styles.roadmapBadgeText, item.badge === 'N4' && styles.roadmapBadgeTextN4, item.badge === 'N3' && styles.roadmapBadgeTextActive]}>{item.badge}</Text></View>}
        <View style={styles.fill}>
          <View style={styles.between}>
            <View style={styles.roadmapTitleRow}>
              <Text style={[styles.roadmapTitle, !wide && styles.mobileRoadmapTitle]}>{item.title}</Text>
              {!wide && item.badge === 'N3' ? <Text style={styles.roadmapGoalTag}>목표 코스</Text> : null}
            </View>
            <Text style={[styles.roadmapPercent, !wide && item.progress === 100 && styles.roadmapPercentComplete, !wide && (item.badge === 'N4' || item.progress === 0) && styles.roadmapPercentNeutral]}>
              {item.progress ? `${item.progress}%${wide ? ' 진행 중' : item.progress === 100 ? ' 완료' : ''}` : wide ? '예정' : '순차 오픈'}
            </Text>
          </View>
          <Text style={[styles.roadmapDetail, !wide && styles.mobileRoadmapDetail]}>{item.detail}</Text>
          {item.progress > 0 && item.progress < 100 ? <View style={styles.roadmapProgress}><Progress percent={item.progress} coral={item.badge === 'N3'} neutral={!wide && item.badge === 'N4'} /></View> : null}
        </View>
      </Pressable>
    ))}
  </View>;
  if (wide) return <Card><SectionTitle title="JLPT 합격 로드맵" detail="전체 진도 64%" />{body}</Card>;
  return <View><SectionTitle title="단계별 학습 경로" detail="전체 로드맵" mobile />{body}</View>;
}

function DoctorCard() {
  return <Card style={styles.doctorCard}><View style={styles.doctorHeading}><Icon name={icons.bulb} tint={color.coral} size={19} /><Text style={styles.doctorTitle}>한국어 닥터 해설 · 뉘앙스 족보</Text></View><View style={styles.doctorBody}><Text style={styles.doctorQuestion}>‘〜わけにはいかない’와 ‘〜できない’의 차이</Text><Text style={styles.doctorLine}>できない: 능력이나 신체적 이유로 할 수 없음</Text><Text style={styles.doctorLine}>わけにはいかない: 상황·체면·의리 때문에 할 수 없음</Text></View><Text style={styles.doctorFooter}>JLPT N3에서 헷갈리기 쉬운 문형을 짧게 비교해 보세요.</Text></Card>;
}

const examSections = [
  { title: '1. 문자·어휘 (언어지식)', subtitle: '한자 표기 및 문맥 어휘력', time: '30분', icon: icons.translate, questions: '한자 읽기, 표기, 문맥 규정, 유의어 교체', tip: '매일 15분 필수 한자 100자 반복이 점수 직결!' },
  { title: '2. 문법 형식 (언어지식)', subtitle: '문장 구성 및 글 맥락', time: '독해와 합쳐 70분', icon: icons.grammar, questions: '문법 형태 판단, 문장 구성(순서 맞추기), 글 흐름 완성', tip: '접속 형태와 뉘앙스 차이가 출제 포인트' },
  { title: '3. 독해 (단문·중문·장문)', subtitle: '지문 독해 및 정보 검색 · 60점', time: '문법과 합쳐 70분', icon: icons.guide, questions: '단·중문 내용 이해, 주장의 이유 찾기, 공고문 정보 검색', tip: '질문 먼저 읽고 키워드를 본문에서 스캔하는 전략 필수' },
  { title: '4. 청해 (리스닝)', subtitle: '실시간 청취 및 순발력', time: '40분 / 60점', icon: icons.headphones, questions: '과제 이해, 포인트 이해, 개요 이해, 즉각 응답', tip: '메모하며 듣기 & 특히 마지막 1~2초 즉각 응답 훈련' },
];

function ExamSection({ item }: { item: typeof examSections[number] }) {
  return <View style={styles.examSection}>
    <View style={styles.examSectionHeading}>
      <View style={styles.examSectionIcon}><Icon name={item.icon} tint="#B90538" size={18} /></View>
      <View style={styles.fill}><Text style={styles.examSectionTitle}>{item.title}</Text><Text style={styles.examSectionSubtitle}>{item.subtitle}</Text></View>
      <Text style={styles.examSectionTime}>{item.time}</Text>
    </View>
    <View style={styles.examQuestions}><Icon name={icons.quiz} tint="#B90538" size={16} /><Text style={styles.examQuestionsText}><Text style={styles.examEmphasis}>핵심 문제 유형: </Text>{item.questions}</Text></View>
    <View style={styles.examTip}><Icon name={icons.bulb} tint="#006C49" size={16} /><Text style={styles.examTipText}><Text style={styles.examTipLead}>초보자 팁: </Text>{item.tip}</Text></View>
  </View>;
}

function GuideModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { bottom } = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.guideBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="가이드 닫기" />
      <View style={styles.guideSheet}>
        <View style={styles.guideHandle} />
        <View style={styles.guideHeader}>
          <View style={styles.fill}>
            <View style={styles.guideBadge}><View style={styles.guideBadgeDot} /><Text style={styles.guideBadgeText}>초보자 필독 · N3 기준 180점 만점</Text></View>
            <Text style={styles.guideSheetTitle}>JLPT 시험 구성 가이드</Text>
            <Text style={styles.guideSheetSubtitle}>과락 기준(과목별 19점 미만)을 피하고 시간 배분이 핵심입니다. 각 영역별 특성과 공략법을 확인하세요.</Text>
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="가이드 닫기" style={styles.guideClose}><Icon name={icons.close} tint="#5B4041" size={22} /></Pressable>
        </View>
        <ScrollView style={styles.guideScroll} contentContainerStyle={styles.guideScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.passCard}>
            <View style={styles.passHeading}><View style={styles.passIcon}><Icon name={icons.checkCircle} tint="#FFFFFF" size={18} /></View><Text style={styles.passTitle}>합격 기준 및 과락 안내</Text><Text style={styles.passRequired}>필수 요건</Text></View>
            <View style={styles.passRow}><Text style={styles.passRowLabel}>합격 커트라인</Text><Text style={styles.passScore}>총점 95점 <Text style={styles.passScoreTotal}>/ 180점 만점</Text></Text></View>
            <View style={styles.passRule}><View style={styles.passRuleHeading}><Icon name={icons.checkCircle} tint="#006C49" size={16} /><Text style={styles.passRuleTitle}>각 영역별(언어지식·독해·청해) 기준</Text></View><Text style={styles.passRuleText}>전 과목 <Text style={styles.passRuleStrong}>최소 19점 이상</Text> 획득 필수</Text><Text style={styles.passRuleNote}>※ 총점이 95점을 넘어도 한 과목이라도 19점 미만이면 불합격(과락)</Text></View>
          </View>
          {examSections.map(item => <ExamSection key={item.title} item={item} />)}
          <View style={styles.examReminder}><View style={styles.examReminderIcon}><Icon name={icons.check} tint="#006C49" size={16} /></View><Text style={styles.examReminderText}>마킹 시간은 별도로 주어지지 않으므로 <Text style={styles.examEmphasis}>문제를 풀며 즉시 OMR 표기</Text>하세요.</Text></View>
        </ScrollView>
        <View style={[styles.guideFooter, { paddingBottom: Math.max(bottom, 16) }]}><Pressable style={styles.guideConfirm} onPress={onClose} accessibilityRole="button"><Text style={styles.guideConfirmText}>이해했어요, 학습 시작하기</Text><Icon name={icons.forward} tint="#FFFFFF" size={20} /></Pressable></View>
      </View>
    </View>
  </Modal>;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 700;
  const days = daysToExam();
  const [modal, setModal] = useState<'guide' | 'calendar' | null>(null);
  const [calendarSession, setCalendarSession] = useState(0);

  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={[styles.content, wide && styles.contentWide]} showsVerticalScrollIndicator={false}><Header wide={wide} days={days} />{wide ? <View style={styles.columns}><View style={styles.leftColumn}><GuideCard /><CalendarCard days={days} /><RoadmapCard wide /></View><View style={styles.rightColumn}><LessonCard wide /><ReviewCard wide /><DoctorCard /></View></View> : <View style={styles.mobileColumn}><MobileExam days={days} onGuide={() => setModal('guide')} onCalendar={() => { setCalendarSession(value => value + 1); setModal('calendar'); }} /><LessonCard wide={false} /><ReviewCard wide={false} /><RoadmapCard wide={false} /></View>}</ScrollView><GuideModal visible={modal === 'guide'} onClose={() => setModal(null)} /><ExamCalendarModal key={calendarSession} visible={modal === 'calendar'} onClose={() => setModal(null)} days={days} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.background },
  content: { width: '100%', alignSelf: 'center', paddingBottom: 28 },
  contentWide: { paddingHorizontal: 22, paddingBottom: 40 },
  header: { minHeight: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: color.surface, borderBottomWidth: 1, borderBottomColor: '#E7D9DA' },
  headerWide: { minHeight: 61, paddingHorizontal: 4, backgroundColor: color.background, borderBottomColor: color.line },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandWide: { gap: 7 },
  mobileBrandIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFF1F2', alignItems: 'center', justifyContent: 'center' },
  brandText: { color: color.navy, fontSize: 18, fontFamily: font.bold, letterSpacing: -0.3 },
  brandTextMobile: { color: '#1A1C1A', fontSize: 17, letterSpacing: -0.3 },
  coursePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F5F1EF', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, marginLeft: 12 },
  courseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.coral },
  courseText: { fontSize: 11, fontFamily: font.semibold, color: color.ink },
  headerPlan: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: color.line, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  headerPlanText: { color: color.navy, fontSize: 11, fontFamily: font.semibold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  offline: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E5F2DF', borderWidth: 1, borderColor: '#D0DED0', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 5 },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#50644B' },
  offlineText: { color: '#394C35', fontSize: 11, lineHeight: 14, fontFamily: font.medium },
  mobileBell: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: color.coral, borderWidth: 1, borderColor: color.surface },
  streak: { color: color.green, backgroundColor: color.greenSoft, borderRadius: 18, paddingHorizontal: 9, paddingVertical: 6, fontSize: 11, fontFamily: font.semibold },
  mobileColumn: { width: '100%', maxWidth: 430, alignSelf: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 16 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 18, paddingTop: 20 },
  leftColumn: { flex: 5, minWidth: 0, gap: 17 },
  rightColumn: { flex: 7, minWidth: 0, gap: 17 },
  card: { backgroundColor: color.surface, borderWidth: 1, borderColor: '#EEE5E4', borderRadius: 17, padding: 17 },
  mobileExamCard: { borderColor: '#E7D9DA', borderRadius: 16, padding: 16 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  fill: { flex: 1, minWidth: 0 },
  mutedSmall: { color: color.muted, fontSize: 11, lineHeight: 16, fontFamily: font.body },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  sectionTitle: { color: color.ink, fontSize: 16, lineHeight: 24, fontFamily: font.bold, flexShrink: 1 },
  mobileSectionTitle: { color: '#1A1C1A' },
  sectionDetail: { color: color.navy, fontSize: 11, fontFamily: font.semibold },
  mobileSectionDetail: { color: '#554245', fontSize: 12 },
  reviewMobileHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewCount: { color: color.surface, backgroundColor: color.coral, borderRadius: 10, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2, fontSize: 11, fontFamily: font.numberBold },
  reviewMobileDetail: { color: '#554245', fontSize: 12, fontFamily: font.body },
  planTag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EFEEEB', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 1 },
  planTagText: { color: '#554245', fontSize: 11, lineHeight: 15, fontFamily: font.medium, flexShrink: 1 },
  ddayPlain: { color: color.coral, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#F8D6DC', borderRadius: 6, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, fontSize: 12, fontFamily: font.numberBold },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  levelTag: { color: color.surface, backgroundColor: '#1A1C1A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontFamily: font.numberBold, letterSpacing: 0.4 },
  examTitle: { color: '#1A1C1A', fontSize: 18, lineHeight: 25, fontFamily: font.bold, letterSpacing: -0.3, marginTop: 4 },
  examDivider: { height: 1, backgroundColor: '#E7D9DA', marginTop: 12 },
  guideBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F4F3F1', borderColor: '#E7D9DA', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  guideIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: color.surface, borderWidth: 1, borderColor: '#E7D9DA', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { color: '#1A1C1A', fontSize: 12, fontFamily: font.bold },
  bannerDetail: { color: '#554245', fontSize: 11.5, lineHeight: 16, fontFamily: font.body, marginTop: 2 },
  dateBox: { backgroundColor: '#F4F3F1', borderWidth: 1, borderColor: '#E7D9DA', borderRadius: 12, padding: 12, marginTop: 12, gap: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' },
  dateText: { color: '#554245', fontSize: 12, fontFamily: font.body },
  dateAccent: { color: color.coral, fontFamily: font.bold },
  calendarButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: color.surface, borderColor: '#E7D9DA', borderWidth: 1, borderRadius: 8, minHeight: 38 },
  calendarButtonText: { color: '#1A1C1A', fontSize: 12, fontFamily: font.semibold },
  recommendation: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#E7D9DA', paddingTop: 10, marginTop: 12 },
  recommendationText: { color: '#554245', fontSize: 12, lineHeight: 19, fontFamily: font.body, flex: 1 },
  recommendationLead: { color: '#50644B', fontFamily: font.semibold },
  cardIntro: { color: color.muted, fontSize: 11, lineHeight: 17, fontFamily: font.body, marginBottom: 13 },
  guideGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  guideTile: { width: '48%', flexGrow: 1, backgroundColor: '#F8F7F5', borderRadius: 11, padding: 10, borderWidth: 1, borderColor: '#EEE8E5' },
  guideTileTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tinyDot: { width: 6, height: 6, borderRadius: 3 },
  guideTileTitle: { color: color.ink, fontSize: 11, fontFamily: font.semibold },
  guideTime: { color: color.navy, fontSize: 10, fontFamily: font.semibold, marginTop: 5 },
  guideTileDetail: { color: color.muted, fontSize: 10, lineHeight: 14, fontFamily: font.body, marginTop: 3 },
  calendarInfo: { backgroundColor: '#F6F4F2', borderRadius: 11, padding: 12, gap: 9, marginBottom: 14 },
  calendarValue: { color: color.navy, fontSize: 11, fontFamily: font.semibold },
  hairline: { height: 1, backgroundColor: color.line },
  lessonTag: { color: color.navy, backgroundColor: '#FFF2F4', borderRadius: 5, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontFamily: font.semibold },
  mobileLessonTag: { color: color.coral, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#F8D6DC', paddingHorizontal: 8, paddingVertical: 3 },
  mobileLessonCard: { borderColor: '#E7D9DA', borderRadius: 16, padding: 16 },
  mobileLessonPercent: { color: '#50644B', fontFamily: font.semibold },
  lessonCaption: { color: color.muted, fontSize: 14, fontFamily: font.semibold, marginTop: 12 },
  mobileLessonCaption: { color: '#554245', fontSize: 12 },
  lessonTitle: { color: color.ink, fontSize: 21, fontFamily: font.japaneseBold, marginTop: 5 },
  lessonTitleWide: { fontSize: 29, fontFamily: font.japanese },
  pronunciation: { color: color.navy, fontSize: 11, fontFamily: font.semibold },
  mobileMeaning: { backgroundColor: '#F4F3F1', borderWidth: 1, borderColor: '#E7D9DA', borderRadius: 12, padding: 12, marginTop: 7, marginBottom: 14 },
  mobileGrammarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mobileGrammar: { color: '#1A1C1A', fontSize: 18, lineHeight: 28, fontFamily: font.japaneseBold },
  mobileAudioButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#F8D6DC', alignItems: 'center', justifyContent: 'center' },
  meaningBox: { backgroundColor: '#F7F5F3', borderRadius: 10, padding: 11, marginTop: 12 },
  meaningText: { color: '#554245', fontSize: 12, lineHeight: 18, fontFamily: font.body },
  meaningDetail: { color: color.muted, fontSize: 11, lineHeight: 17, fontFamily: font.body, marginTop: 4 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: color.line, borderRadius: 11, padding: 10, marginTop: 14 },
  audioTitle: { color: color.ink, fontSize: 11, fontFamily: font.semibold },
  audioExample: { color: color.muted, fontSize: 10, fontFamily: font.japanese, marginTop: 3 },
  audioLength: { color: color.coral, fontSize: 10, fontFamily: font.number },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 7 },
  percentText: { color: color.navy, fontSize: 11, fontFamily: font.numberBold },
  progressTrack: { height: 7, borderRadius: 5, backgroundColor: '#ECEDEA', overflow: 'hidden' },
  mobileProgressTrack: { height: 6, backgroundColor: '#EFEEEB' },
  progressFill: { height: '100%', borderRadius: 5 },
  primaryButton: { minHeight: 48, borderRadius: 12, backgroundColor: color.coral, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  mobileButtonGradient: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  primaryButtonWide: { backgroundColor: color.coral, minHeight: 52, marginTop: 16, borderRadius: 11 },
  primaryButtonText: { color: color.surface, fontSize: 14, lineHeight: 20, fontFamily: font.semibold },
  reviewAlert: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#F8D6DC', borderRadius: 8, padding: 10, marginBottom: 12 },
  reviewAlertText: { color: '#BA1A1A', fontSize: 12, lineHeight: 18, fontFamily: font.medium },
  reviewAlertWide: { backgroundColor: color.amberSoft, borderWidth: 0, marginBottom: 11 },
  reviewAlertTextWide: { color: color.amber },
  mobileReviewCard: { borderColor: '#E7D9DA', borderRadius: 16, padding: 16 },
  flashGrid: { flexDirection: 'row', gap: 9 },
  flashCard: { flex: 1, minWidth: 0, backgroundColor: '#FBFBFA', borderWidth: 1, borderColor: color.line, borderRadius: 10, padding: 11 },
  mobileFlashCard: { backgroundColor: '#F9F8F7', borderColor: '#E7D9DA', borderRadius: 12, padding: 10 },
  flashLabel: { color: color.coral, fontSize: 10, fontFamily: font.semibold },
  mobileFlashLabel: { color: '#993850', fontSize: 10.5 },
  flashLabelGreen: { color: '#50644B' },
  flashTitle: { color: color.ink, fontSize: 14, lineHeight: 22, fontFamily: font.japaneseBold, marginTop: 9 },
  mobileFlashTitle: { color: '#1A1C1A', marginTop: 7 },
  flashMeaning: { color: color.muted, fontSize: 12, fontFamily: font.body, marginTop: 4 },
  mobileFlashMeaning: { color: '#554245', marginTop: 3 },
  flashDetail: { color: color.muted, fontSize: 10, lineHeight: 15, fontFamily: font.japanese, borderTopWidth: 1, borderTopColor: color.line, paddingTop: 6, marginTop: 9 },
  secondaryButton: { minHeight: 39, borderRadius: 11, backgroundColor: '#FFF3F4', marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: '#F8D6DC' },
  secondaryButtonWide: { borderRadius: 9, backgroundColor: '#FFF1F3', marginTop: 11, borderColor: color.line },
  secondaryButtonText: { color: color.ink, fontSize: 12, fontFamily: font.semibold, textAlign: 'center' },
  roadmapList: { gap: 8 },
  mobileRoadmapList: { gap: 8 },
  roadmapItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: color.line, borderWidth: 1, borderRadius: 10, padding: 10, backgroundColor: color.surface },
  mobileRoadmapItem: { borderColor: '#E7D9DA', borderRadius: 12, padding: 14, minHeight: 62 },
  mobileRoadmapLocked: { borderStyle: 'dashed', backgroundColor: '#F7F6F4' },
  roadmapActive: { borderColor: '#F5A7B9', borderWidth: 2, backgroundColor: color.surface },
  roadmapLocked: { opacity: 0.55 },
  roadmapBadge: { width: 31, height: 31, borderRadius: 16, backgroundColor: color.greenSoft, alignItems: 'center', justifyContent: 'center' },
  mobileRoadmapBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D3E9CA' },
  roadmapBadgeN4: { backgroundColor: '#F1F1EC' },
  roadmapBadgeActive: { backgroundColor: color.navy },
  roadmapBadgeText: { color: color.green, fontSize: 11, fontFamily: font.numberBold },
  roadmapBadgeTextN4: { color: color.ink },
  roadmapBadgeTextActive: { color: color.surface },
  roadmapTitle: { color: color.ink, fontSize: 12, fontFamily: font.bold, flexShrink: 1 },
  mobileRoadmapTitle: { color: '#1A1C1A' },
  roadmapTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0, flexShrink: 1 },
  roadmapGoalTag: { color: color.coral, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#F8D6DC', borderRadius: 4, overflow: 'hidden', paddingHorizontal: 5, paddingVertical: 1, fontSize: 10, fontFamily: font.semibold },
  roadmapPercent: { color: color.navy, fontSize: 11, fontFamily: font.numberBold },
  roadmapPercentComplete: { color: color.green },
  roadmapPercentNeutral: { color: color.muted },
  roadmapDetail: { color: color.muted, fontSize: 11, fontFamily: font.body, marginTop: 3 },
  mobileRoadmapDetail: { color: '#554245' },
  roadmapProgress: { marginTop: 8 },
  doctorCard: { borderLeftWidth: 4, borderLeftColor: color.coral },
  doctorHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  doctorTitle: { color: color.ink, fontSize: 14, fontFamily: font.bold, flex: 1 },
  doctorBody: { backgroundColor: '#F7F5F3', borderRadius: 10, padding: 12, marginTop: 12, gap: 7 },
  doctorQuestion: { color: color.ink, fontSize: 12, fontFamily: font.semibold },
  doctorLine: { color: color.muted, fontSize: 11, lineHeight: 17, fontFamily: font.body },
  doctorFooter: { color: color.muted, fontSize: 10, fontFamily: font.body, marginTop: 10 },
  guideBackdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(41,48,64,0.6)' },
  guideSheet: { width: '100%', maxWidth: 440, maxHeight: '90%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', shadowColor: '#E11D48', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 16 },
  guideHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E3BDBF', alignSelf: 'center', marginTop: 11, marginBottom: 7 },
  guideHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0E2E3' },
  guideBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFDADB', borderWidth: 1, borderColor: '#E3BDBF', borderRadius: 16, paddingHorizontal: 9, paddingVertical: 3 },
  guideBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B90538' },
  guideBadgeText: { color: '#B90538', fontSize: 10, lineHeight: 14, fontFamily: font.bold },
  guideSheetTitle: { color: '#141B2B', fontSize: 18, lineHeight: 26, fontFamily: font.bold, marginTop: 9 },
  guideSheetSubtitle: { color: '#5B4041', fontSize: 12, lineHeight: 19, fontFamily: font.body, marginTop: 4 },
  guideClose: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  guideScroll: { flexShrink: 1 },
  guideScrollContent: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  passCard: { backgroundColor: '#FFF3F3', borderWidth: 1, borderColor: '#E3BDBF', borderRadius: 16, padding: 14, gap: 10 },
  passHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#DC2C4F', alignItems: 'center', justifyContent: 'center' },
  passTitle: { color: '#B90538', fontSize: 13, lineHeight: 18, fontFamily: font.bold, flex: 1 },
  passRequired: { color: '#B90538', fontSize: 10, fontFamily: font.bold, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3BDBF', borderRadius: 12, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  passRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E2E3', borderRadius: 12, padding: 11 },
  passRowLabel: { color: '#141B2B', fontSize: 12, fontFamily: font.medium },
  passScore: { color: '#B90538', fontSize: 14, fontFamily: font.bold },
  passScoreTotal: { color: '#63595C', fontSize: 10, fontFamily: font.body },
  passRule: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E2E3', borderRadius: 12, padding: 11 },
  passRuleHeading: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  passRuleTitle: { color: '#141B2B', fontSize: 11, lineHeight: 17, fontFamily: font.bold, flex: 1 },
  passRuleText: { color: '#5B4041', fontSize: 12, lineHeight: 19, fontFamily: font.body, marginLeft: 21, marginTop: 4 },
  passRuleStrong: { color: '#B90538', fontFamily: font.bold },
  passRuleNote: { color: '#63595C', fontSize: 10, lineHeight: 16, fontFamily: font.body, marginLeft: 21, marginTop: 2 },
  examSection: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EADCDD', borderRadius: 16, padding: 14, gap: 9, shadowColor: '#E11D48', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  examSectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  examSectionIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#E9EDFF', alignItems: 'center', justifyContent: 'center' },
  examSectionTitle: { color: '#141B2B', fontSize: 12, lineHeight: 18, fontFamily: font.bold },
  examSectionSubtitle: { color: '#63595C', fontSize: 10, lineHeight: 15, fontFamily: font.body },
  examSectionTime: { maxWidth: 88, color: '#B90538', backgroundColor: '#FFDADB', borderWidth: 1, borderColor: '#E3BDBF', borderRadius: 14, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, lineHeight: 14, textAlign: 'center', fontFamily: font.bold },
  examQuestions: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#F9F9FF', borderWidth: 1, borderColor: '#F0E2E3', borderRadius: 10, padding: 9 },
  examQuestionsText: { color: '#5B4041', fontSize: 11, lineHeight: 17, fontFamily: font.body, flex: 1 },
  examEmphasis: { color: '#141B2B', fontFamily: font.bold },
  examTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 7 },
  examTipText: { color: '#006C49', fontSize: 11, lineHeight: 17, fontFamily: font.medium, flex: 1 },
  examTipLead: { fontFamily: font.bold },
  examReminder: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9F9FF', borderWidth: 1, borderColor: '#F0E2E3', borderRadius: 14, padding: 12 },
  examReminderIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D7FBE6', alignItems: 'center', justifyContent: 'center' },
  examReminderText: { color: '#5B4041', fontSize: 11, lineHeight: 17, fontFamily: font.body, flex: 1 },
  guideFooter: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0E2E3', backgroundColor: '#FFFFFF' },
  guideConfirm: { minHeight: 52, borderRadius: 14, backgroundColor: '#DC2C4F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 4 },
  guideConfirmText: { color: '#FFFFFF', fontSize: 15, lineHeight: 21, fontFamily: font.bold },
});
