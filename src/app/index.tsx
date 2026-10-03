import { router } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#FFFDFC', white: '#FFFFFF', ink: '#29252A', muted: '#89848A',
  line: '#F0E8E7', pink: '#EF3863', pinkSoft: '#FFF0F3',
  green: '#5E7D62', greenSoft: '#F0F6F0', warm: '#F9F6F3',
};

function Icon({ android, ios, color, size = 20 }: {
  android: AndroidSymbol; ios: SFSymbol; color: string; size?: number;
}) {
  return <SymbolView name={{ android, web: android, ios }} tintColor={color} size={size} />;
}

function daysToExam() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((new Date(2026, 11, 6).getTime() - today.getTime()) / 86400000);
}

function Heading({ title, more }: { title: string; more: string }) {
  return <View style={s.heading}><Text style={s.headingTitle}>{title}</Text><Pressable style={s.moreLink} onPress={() => router.push('/course')}><Text style={s.more}>{more}</Text><Icon android="chevron_right" ios="chevron.right" color={C.muted} size={15} /></Pressable></View>;
}

function SmallLesson({ icon, title, detail, tint }: { icon: string; title: string; detail: string; tint: string }) {
  return (
    <Pressable style={s.smallLesson} onPress={() => router.push('/course')}>
      <View style={[s.smallIcon, { backgroundColor: tint }]}><Text style={s.smallIconText}>{icon}</Text></View>
      <Text style={s.smallTitle}>{title}</Text>
      <Text style={s.smallDetail}>{detail}</Text>
      <View style={s.smallArrow}><Icon android="arrow_outward" ios="arrow.up.right" color="#BDB6B6" size={16} /></View>
    </Pressable>
  );
}

function Path({ badge, title, detail, status, completed, current, locked }: {
  badge?: string; title: string; detail: string; status: string; completed?: boolean; current?: boolean; locked?: boolean;
}) {
  return (
    <Pressable disabled={locked} onPress={() => router.push('/course')} style={[s.path, current && s.pathCurrent, locked && s.pathLocked]}>
      <View style={[s.pathBadge, current && s.pathBadgeCurrent]}>
        {completed ? <Icon android="check" ios="checkmark" color={C.green} size={18} /> : <Text style={[s.pathBadgeText, current && s.pathBadgeTextCurrent]}>{badge}</Text>}
      </View>
      <View style={s.pathBody}>
        <View style={s.pathNameRow}><Text style={s.pathName}>{title}</Text><Text style={[s.pathStatus, current && s.pathStatusCurrent]}>{status}</Text></View>
        <Text style={s.pathDetail}>{detail}</Text>
        {current && <View style={s.pathTrack}><View style={s.pathFill} /></View>}
      </View>
      <Icon android={locked ? 'lock' : 'chevron_right'} ios={locked ? 'lock' : 'chevron.right'} color="#BDB6B6" size={21} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const days = daysToExam();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.brand}><Icon android="local_florist" ios="camera.macro" color={C.pink} size={25} /><Text style={s.brandText}>JLPT 완주</Text></View>
          <View style={s.headerPill}><Icon android="auto_awesome" ios="sparkles" color={C.green} size={13} /><Text style={s.headerPillText}>오늘도 한 걸음</Text></View>
        </View>

        <View style={s.examCard}>
          <View style={s.examTop}>
            <View style={s.eyebrowRow}><Icon android="local_florist" ios="camera.macro" color={C.pink} size={15} /><Text style={s.eyebrow}>나의 첫 JLPT 도전</Text></View>
            <View style={s.dDay}><Text style={s.dDayText}>{days > 0 ? 'D-' + days : '일정 확인'}</Text></View>
          </View>
          <Text style={s.examTitle}>2026년 제2회 JLPT N3 대비</Text>
          <Text style={s.examSub}>조금씩, 매일 함께 준비해요.</Text>
          <View style={s.schedule}>
            <Icon android="calendar_today" ios="calendar" color={C.ink} size={19} />
            <View style={s.scheduleBody}>
              <Text style={s.scheduleTitle}>시험일  12월 6일 일요일</Text>
              <Text style={s.scheduleDetail}>일반 접수 9.01–9.20  ·  추가 접수 9.28–10.04</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <View style={s.infoIcon}><Icon android="schedule" ios="clock" color={C.green} size={18} /></View>
            <View style={s.infoBody}><Text style={s.infoTitle}>시험까지 {Math.max(days, 0)}일</Text><Text style={s.infoDetail}>남은 기간에 맞춰 오늘의 학습 목표를 알려드려요.</Text></View>
          </View>
          <View style={s.infoRow}>
            <View style={s.infoIcon}><Icon android="menu_book" ios="book" color={C.green} size={18} /></View>
            <View style={s.infoBody}><Text style={s.infoTitle}>현재 과정 · N5 기초 다지기</Text><Text style={s.infoDetail}>기초 문장부터 차근차근 시작해요.</Text></View>
          </View>
          <View style={s.encouragement}><Icon android="auto_awesome" ios="sparkles" color={C.green} size={14} /><Text style={s.encouragementText}>오늘의 작은 한 걸음이 큰 실력이 돼요!</Text></View>
        </View>

        <View style={s.continueCard}>
          <View style={s.continueTop}><Text style={s.pinkLabel}>오늘 이어하기</Text><Text style={s.greenLabel}>오늘의 목표  3개</Text></View>
          <Text style={s.continueStep}>다음 학습  1/3</Text>
          <View style={s.continueTitleRow}><Text style={s.continueTitle}>はじめてのあいさつ</Text><Icon android="local_florist" ios="camera.macro" color={C.pink} size={16} /></View>
          <Text style={s.continueSub}>처음 만났을 때 나누는 쉬운 일본어 인사</Text>
          <View style={s.progress}><View style={s.progressFill} /></View>
          <Pressable style={s.mainButton} onPress={() => router.push('/course')}><Text style={s.mainButtonText}>이어서 공부하기</Text><Icon android="chevron_right" ios="chevron.right" color={C.white} size={18} /></Pressable>
        </View>

        <Heading title="오늘의 학습" more="전체 보기" />
        <View style={s.todayNotice}><Icon android="favorite_border" ios="heart" color="#B66C79" size={16} /><Text style={s.todayNoticeText}>오늘은 짧은 수업 2개와 복습 1개를 해봐요.</Text></View>
        <View style={s.lessonGrid}>
          <SmallLesson icon="あ" title="히라가나" detail="기본 글자 익히기" tint="#FFF1E8" />
          <SmallLesson icon="文" title="기초 문장" detail="인사 표현 배우기" tint="#F0F5EC" />
        </View>
        <Pressable style={s.reviewBanner} onPress={() => router.push('/review')}><View style={s.reviewLabel}><Icon android="favorite_border" ios="heart" color="#B86F7A" size={16} /><Text style={s.reviewText}>오늘의 복습도 잊지 마세요!</Text></View><Icon android="chevron_right" ios="chevron.right" color={C.pink} size={20} /></Pressable>

        <Heading title="단계별 학습 경로" more="전체 과정 보기" />
        <View style={s.paths}>
          <Path completed title="입문 · 문자와 발음" detail="히라가나부터 천천히 시작하기" status="완료" />
          <Path badge="N5" title="N5 기초 다지기" detail="쉬운 단어와 문장으로 첫걸음" status="학습 중" current />
          <Path badge="N4" title="N4 실력 쌓기" detail="문법과 짧은 독해 연습" status="예정" locked />
          <Path badge="N3" title="N3 합격 도전" detail="독해·청해와 모의 연습" status="예정" locked />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36 },
  header: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandText: { color: C.ink, fontSize: 17, fontWeight: '800' },
  headerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.greenSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  headerPillText: { color: C.green, fontSize: 10, fontWeight: '700' },
  examCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 17, padding: 17, marginTop: 5 },
  examTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  eyebrow: { color: C.muted, fontSize: 10, fontWeight: '700' },
  dDay: { backgroundColor: C.pinkSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  dDayText: { color: C.pink, fontSize: 10, fontWeight: '800' },
  examTitle: { color: C.ink, fontSize: 19, fontWeight: '800', marginTop: 12 },
  examSub: { color: C.muted, fontSize: 11, marginTop: 5 },
  schedule: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.warm, borderRadius: 11, padding: 12, marginTop: 16, gap: 11 },
  scheduleBody: { flex: 1, gap: 4 },
  scheduleTitle: { color: C.ink, fontSize: 12, fontWeight: '800' },
  scheduleDetail: { color: C.muted, fontSize: 10 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 16 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 13 },
  infoIcon: { width: 20, alignItems: 'center' },
  infoBody: { flex: 1, gap: 3 },
  infoTitle: { color: C.ink, fontSize: 11, fontWeight: '700' },
  infoDetail: { color: C.muted, fontSize: 10, lineHeight: 15 },
  encouragement: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FAF8F5', borderRadius: 7, paddingVertical: 9, paddingHorizontal: 10 },
  encouragementText: { color: C.green, fontSize: 10, fontWeight: '700' },
  continueCard: { backgroundColor: C.white, borderWidth: 1, borderColor: '#F3DEE4', borderRadius: 16, padding: 17, marginTop: 16 },
  continueTop: { flexDirection: 'row', justifyContent: 'space-between' },
  pinkLabel: { color: C.pink, fontSize: 10, fontWeight: '800' },
  greenLabel: { color: C.green, fontSize: 10, fontWeight: '700' },
  continueStep: { color: C.muted, fontSize: 10, marginTop: 12 },
  continueTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  continueTitle: { color: C.ink, fontSize: 18, fontWeight: '800' },
  continueSub: { color: C.muted, fontSize: 11, marginTop: 6 },
  progress: { height: 5, backgroundColor: '#F5E6E9', borderRadius: 5, marginTop: 17, overflow: 'hidden' },
  progressFill: { width: '61%', height: '100%', backgroundColor: C.pink },
  mainButton: { flexDirection: 'row', gap: 3, backgroundColor: C.pink, borderRadius: 10, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  mainButtonText: { color: C.white, fontSize: 13, fontWeight: '800' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  headingTitle: { color: C.ink, fontSize: 16, fontWeight: '800' },
  moreLink: { flexDirection: 'row', alignItems: 'center' },
  more: { color: C.muted, fontSize: 10, fontWeight: '600' },
  todayNotice: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FBE2E6', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12 },
  todayNoticeText: { color: '#B66C79', fontSize: 11, fontWeight: '600' },
  lessonGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  smallLesson: { flex: 1, minHeight: 118, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 12 },
  smallIcon: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  smallIconText: { color: C.ink, fontSize: 15, fontWeight: '700' },
  smallTitle: { color: C.ink, fontSize: 12, fontWeight: '800', marginTop: 8 },
  smallDetail: { color: C.muted, fontSize: 10, marginTop: 3 },
  smallArrow: { position: 'absolute', top: 10, right: 12 },
  reviewBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF7F7', borderWidth: 1, borderColor: '#F5DDE2', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, marginTop: 10 },
  reviewLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reviewText: { color: '#B86F7A', fontSize: 11, fontWeight: '700' },
  paths: { gap: 9 },
  path: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 11 },
  pathCurrent: { borderColor: '#F7B7C6', backgroundColor: '#FFF8F9' },
  pathLocked: { opacity: 0.58 },
  pathBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  pathBadgeCurrent: { backgroundColor: C.pink },
  pathBadgeText: { color: C.green, fontSize: 11, fontWeight: '800' },
  pathBadgeTextCurrent: { color: C.white },
  pathBody: { flex: 1 },
  pathNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  pathName: { color: C.ink, fontSize: 11, fontWeight: '800' },
  pathStatus: { color: C.green, fontSize: 9, fontWeight: '700' },
  pathStatusCurrent: { color: C.pink },
  pathDetail: { color: C.muted, fontSize: 10, marginTop: 4 },
  pathTrack: { height: 3, backgroundColor: '#F6E1E5', borderRadius: 4, marginTop: 9, overflow: 'hidden' },
  pathFill: { width: '38%', height: '100%', backgroundColor: C.pink },
});
