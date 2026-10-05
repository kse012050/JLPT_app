import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHANGE_END, dateKey, EXAM_YEAR, EXTRA_END, EXTRA_START, FIRST_EXAM, HOLIDAYS, REGULAR_END, REGULAR_START, registrationStatus, SECOND_EXAM, TICKET_START } from '@/constants/exam-schedule';

const font = { body: 'NotoSansKR_400Regular', medium: 'NotoSansKR_500Medium', bold: 'NotoSansKR_700Bold', number: 'PlusJakartaSans_700Bold' };
const colors = { ink: '#141B2B', muted: '#63595C', rose: '#B90538', coral: '#DC2C4F', border: '#EADCDD', tint: '#FFF3F3', green: '#006C49' };
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const minMonth = 6;
const maxMonth = 11;

function initialMonth() {
  const now = new Date();
  if (now.getFullYear() < EXAM_YEAR) return minMonth;
  if (now.getFullYear() > EXAM_YEAR) return maxMonth;
  return Math.min(maxMonth, Math.max(minMonth, now.getMonth()));
}

function dateDetails(key: string) {
  if (key === FIRST_EXAM) return { title: '제1회 JLPT 시험일', detail: '7월 시험은 종료되었습니다.' };
  if (key === SECOND_EXAM) return { title: '제2회 JLPT 본시험', detail: '2026년 12월 6일(일) 실시 예정입니다.' };
  if (key === REGULAR_START) return { title: '일반접수 시작', detail: '2026년 제2회 JLPT 일반접수가 시작되었습니다.' };
  if (key === REGULAR_END) return { title: '일반접수 마감', detail: '일반접수 마감일은 9월 20일(일)입니다.' };
  if (key === EXTRA_START) return { title: '추가접수 시작', detail: '추가접수 기간은 9월 28일~10월 4일입니다.' };
  if (key === EXTRA_END) return { title: '추가접수 마감', detail: '추가접수 마감일은 10월 4일(일)입니다.' };
  if (key === CHANGE_END) return { title: '접수정보 변경 마감', detail: '서울 실시위원회 기준 접수정보 변경 마감일입니다. 지역별 안내를 확인하세요.' };
  if (key === TICKET_START) return { title: '수험표 출력 시작', detail: '서울 실시위원회 기준 수험표 출력 시작일입니다.' };
  if (HOLIDAYS[key]) return { title: HOLIDAYS[key], detail: '대한민국 공휴일입니다.' };
  if (key >= REGULAR_START && key <= REGULAR_END) return { title: '일반접수 기간', detail: '9월 1일~20일은 제2회 JLPT 일반접수 기간입니다.' };
  if (key >= EXTRA_START && key <= EXTRA_END) return { title: '추가접수 기간', detail: '9월 28일~10월 4일은 제2회 JLPT 추가접수 기간입니다.' };
  return { title: '공식 일정 없음', detail: '이 날짜에 등록된 JLPT 공식 일정이나 한국 공휴일은 없습니다.' };
}

function dayKind(key: string) {
  if (key === FIRST_EXAM || key === SECOND_EXAM) return 'exam';
  if (HOLIDAYS[key]) return 'holiday';
  if (key >= REGULAR_START && key <= REGULAR_END) return 'regular';
  if (key >= EXTRA_START && key <= EXTRA_END) return 'extra';
  if (key === CHANGE_END || key === TICKET_START) return 'milestone';
  return null;
}

function Legend({ color, title }: { color: string; title: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{title}</Text></View>;
}

export function ExamCalendarModal({ visible, onClose, days }: { visible: boolean; onClose: () => void; days: number }) {
  const { bottom } = useSafeAreaInsets();
  const [month, setMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const today = dateKey(new Date());
  const selected = dateDetails(selectedDate);
  const firstWeekday = new Date(EXAM_YEAR, month, 1).getDay();
  const dayCount = new Date(EXAM_YEAR, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= dayCount ? day : null;
  });
  const canGoBack = month > minMonth;
  const canGoForward = month < maxMonth;

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="시험 일정 닫기" />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.fill}>
            <Text style={styles.badge}>● 2026년 제2회 정기시험</Text>
            <Text style={styles.title}>JLPT 시험 & 학습 달력</Text>
            <Text style={styles.subtitle}>한국 공식 접수 기간과 시험일, 공휴일을 확인하세요.</Text>
          </View>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="시험 일정 닫기"><Text style={styles.closeText}>×</Text></Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.examCards}>
            <View style={[styles.examCard, styles.examCardPast]}><Text style={styles.examCardTop}>2026 제1회 (여름)</Text><Text style={styles.examCardDate}>7월 5일(일)</Text><Text style={styles.examCardBottom}>본시험 종료</Text></View>
            <View style={[styles.examCard, styles.examCardCurrent]}><View style={styles.examCardHeading}><Text style={styles.examCardCurrentTop}>2026 제2회 (겨울)</Text><Text style={styles.dday}>{days > 0 ? `D-${days}` : days === 0 ? 'D-DAY' : '종료'}</Text></View><Text style={styles.examCardCurrentDate}>12월 6일(일)</Text><Text style={styles.examCardBottom}>실제 시험 일정</Text></View>
          </View>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeading}><Text style={styles.monthTitle}>2026년 {month + 1}월</Text><Text style={styles.monthTag}>{registrationStatus(today)}</Text><View style={styles.fill} /><Pressable disabled={!canGoBack} onPress={() => setMonth(month - 1)} accessibilityRole="button" accessibilityLabel="이전 달" style={styles.monthArrow}><Text style={[styles.monthArrowText, !canGoBack && styles.arrowDisabled]}>‹</Text></Pressable><Pressable disabled={!canGoForward} onPress={() => setMonth(month + 1)} accessibilityRole="button" accessibilityLabel="다음 달" style={styles.monthArrow}><Text style={[styles.monthArrowText, !canGoForward && styles.arrowDisabled]}>›</Text></Pressable></View>
            <View style={styles.divider} />
            <View style={styles.legend}><Legend color="#B90538" title="접수·시험" /><Legend color="#F2A6AE" title="공휴일" /><Legend color="#006C49" title="수험 안내" /><Legend color="#141B2B" title="오늘" /></View>
            <View style={styles.weekHeader}>{weekDays.map((day, index) => <Text key={day} style={[styles.weekText, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{day}</Text>)}</View>
            <View style={styles.dayGrid}>{cells.map((day, index) => {
              if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />;
              const key = `${EXAM_YEAR}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const kind = dayKind(key);
              const isToday = key === today;
              const isSelected = key === selectedDate;
              const isExam = kind === 'exam';
              const isHoliday = kind === 'holiday';
              return <Pressable key={key} onPress={() => setSelectedDate(key)} accessibilityRole="button" accessibilityLabel={`${month + 1}월 ${day}일 ${dateDetails(key).title}`} style={[styles.dayCell, isSelected && styles.daySelected, isExam && styles.dayExam, isToday && !isSelected && styles.dayToday]}><Text style={[styles.dayNumber, (index % 7 === 0 || isHoliday) && styles.sunday, index % 7 === 6 && styles.saturday, (isSelected || isExam) && styles.dayNumberActive]}>{day}</Text>{kind ? <View style={[styles.eventDot, kind === 'holiday' ? styles.eventHoliday : kind === 'milestone' ? styles.eventMilestone : styles.eventExam, (isSelected || isExam) && styles.eventActive]} /> : null}</Pressable>;
            })}</View>
          </View>
          <View style={styles.detailCard}><View style={styles.detailIcon}><Text style={styles.detailIconText}>●</Text></View><View style={styles.fill}><Text style={styles.detailDate}>{selectedDate.replaceAll('-', '.')}</Text><Text style={styles.detailTitle}>{selected.title}</Text><Text style={styles.detailBody}>{selected.detail}</Text></View></View>
          <Text style={styles.sourceNote}>한국 실시기관 공지 기준 · 지역별 변경 사항은 공식 사이트에서 확인하세요.</Text>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(bottom, 16) }]}><Pressable onPress={() => { void Linking.openURL('https://www.jlpt.or.kr/html/index.html'); }} style={styles.footerButton} accessibilityRole="button"><Text style={styles.footerButtonText}>공식 JLPT 일정 확인하기 ↗</Text></Pressable></View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(41,48,64,0.6)' },
  sheet: { width: '100%', maxWidth: 440, maxHeight: '92%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', shadowColor: '#E11D48', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 16 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E3BDBF', alignSelf: 'center', marginTop: 11, marginBottom: 7 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 15 },
  fill: { flex: 1 },
  badge: { alignSelf: 'flex-start', overflow: 'hidden', color: colors.rose, backgroundColor: '#FFDADB', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontFamily: font.bold },
  title: { color: colors.ink, fontSize: 19, lineHeight: 27, fontFamily: font.bold, marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 11, lineHeight: 18, fontFamily: font.body, marginTop: 4 },
  close: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#5B4041', fontSize: 27, lineHeight: 30 },
  scroll: { flexShrink: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 18, gap: 14 },
  examCards: { flexDirection: 'row', gap: 10 },
  examCard: { flex: 1, minHeight: 100, borderRadius: 14, padding: 11, justifyContent: 'center' },
  examCardPast: { backgroundColor: '#F9F9FF', borderWidth: 1, borderColor: '#E9E8EE' },
  examCardCurrent: { backgroundColor: colors.tint, borderWidth: 2, borderColor: colors.rose },
  examCardTop: { color: colors.muted, fontSize: 10, fontFamily: font.medium },
  examCardHeading: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  examCardCurrentTop: { color: colors.rose, fontSize: 10, fontFamily: font.bold, flex: 1 },
  examCardDate: { color: colors.ink, fontSize: 17, fontFamily: font.bold, marginTop: 5 },
  examCardCurrentDate: { color: colors.rose, fontSize: 17, fontFamily: font.bold, marginTop: 5 },
  examCardBottom: { color: colors.muted, fontSize: 10, fontFamily: font.body, marginTop: 3 },
  dday: { overflow: 'hidden', color: '#FFFFFF', backgroundColor: colors.rose, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontFamily: font.number },
  calendarCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, backgroundColor: '#FFFFFF' },
  calendarHeading: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  monthTitle: { color: colors.ink, fontSize: 15, fontFamily: font.bold },
  monthTag: { color: colors.rose, backgroundColor: '#FFDADB', overflow: 'hidden', borderRadius: 9, paddingHorizontal: 6, paddingVertical: 3, fontSize: 9, fontFamily: font.bold },
  monthArrow: { width: 27, height: 28, alignItems: 'center', justifyContent: 'center' },
  monthArrowText: { color: colors.muted, fontSize: 24, lineHeight: 27 },
  arrowDisabled: { color: '#D5D0D1' },
  divider: { height: 1, backgroundColor: '#F0E2E3', marginVertical: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 5, marginBottom: 9 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: colors.muted, fontSize: 9, fontFamily: font.body },
  weekHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0E2E3', paddingBottom: 4 },
  weekText: { width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 10, fontFamily: font.bold },
  sunday: { color: colors.rose },
  saturday: { color: '#4362A1' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  dayCell: { width: '14.2857%', height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center', gap: 1 },
  daySelected: { backgroundColor: colors.rose },
  dayExam: { backgroundColor: colors.coral },
  dayToday: { borderWidth: 1, borderColor: colors.ink },
  dayNumber: { color: colors.ink, fontSize: 11, lineHeight: 15, fontFamily: font.medium },
  dayNumberActive: { color: '#FFFFFF', fontFamily: font.bold },
  eventDot: { width: 4, height: 4, borderRadius: 2 },
  eventHoliday: { backgroundColor: '#F2A6AE' },
  eventMilestone: { backgroundColor: colors.green },
  eventExam: { backgroundColor: colors.rose },
  eventActive: { backgroundColor: '#FFFFFF' },
  detailCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#F0D2D6', borderRadius: 14, padding: 12, backgroundColor: '#FFF8F8' },
  detailIcon: { width: 29, height: 29, borderRadius: 8, backgroundColor: colors.rose, alignItems: 'center', justifyContent: 'center' },
  detailIconText: { color: '#FFFFFF', fontSize: 13 },
  detailDate: { color: colors.rose, fontSize: 9, fontFamily: font.bold },
  detailTitle: { color: colors.ink, fontSize: 12, fontFamily: font.bold, marginTop: 2 },
  detailBody: { color: colors.muted, fontSize: 10, lineHeight: 16, fontFamily: font.body, marginTop: 3 },
  sourceNote: { color: colors.muted, fontSize: 9, lineHeight: 15, fontFamily: font.body },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0E2E3', backgroundColor: '#FFFFFF' },
  footerButton: { minHeight: 52, borderRadius: 14, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  footerButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: font.bold },
});
