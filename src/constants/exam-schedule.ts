// 2026년 한국 JLPT 시행기관 공지: https://www.jlpt.or.kr/html/index.html
export const EXAM_YEAR = 2026;
export const FIRST_EXAM = '2026-07-05';
export const SECOND_EXAM = '2026-12-06';
export const REGULAR_START = '2026-09-01';
export const REGULAR_END = '2026-09-20';
export const EXTRA_START = '2026-09-28';
export const EXTRA_END = '2026-10-04';
export const CHANGE_END = '2026-10-11';
export const TICKET_START = '2026-10-26';

// 한국천문연구원 2026 월력요항: https://www.kasi.re.kr/kor/post/newsMaterial/32031
export const HOLIDAYS: Record<string, string> = {
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-05': '개천절 대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
};

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function registrationStatus(today = dateKey(new Date())) {
  if (today < REGULAR_START) return '일반접수 예정';
  if (today <= REGULAR_END) return '일반접수 중';
  if (today < EXTRA_START) return '추가접수 예정';
  if (today <= EXTRA_END) return '추가접수 중';
  return '접수 마감';
}
