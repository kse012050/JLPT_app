---
name: Japanese Learning System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444651'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#b90538'
  on-secondary: '#ffffff'
  secondary-container: '#dc2c4f'
  on-secondary-container: '#fffbff'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-kanji-hero:
    fontFamily: Noto Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-kanji-sentence:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: 0.01em
  body-ruby-furigana:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: '0'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

> 이 문서는 이전 파란색 디자인의 보관용 스냅샷입니다. 현재 적용 중인 분홍·크림 디자인과 복구 상태는 아래 `Stitch 동기화 메모`를 참고하세요.

## 브랜드와 스타일
이 디자인 시스템은 JLPT N5부터 N3까지 공부하는 한국어 학습자를 위한 차분하고 체계적이면서도 학습 의욕을 북돋는 공간을 지향한다. 학습의 밀도와 심리적 편안함을 함께 고려하며, 복잡한 게임 요소보다 목적이 분명하고 집중하기 쉬운 환경을 통해 꾸준히 공부할 자신감을 준다.

스타일은 **현대적인 실용성**과 **일본식 편집 디자인의 촉각적 미니멀리즘**을 결합한다.
- **명확성 우선**: 한자, 히라가나, 가타카나, 한글처럼 형태가 복잡한 글자 주변에 충분한 여백을 두어 오래 공부해도 눈의 피로가 쌓이지 않도록 한다.
- **절제된 강조**: 선명한 슬레이트 계열 색상으로 안정감을 주고, 주요 성취 지점에는 따뜻한 사쿠라 코랄 색상을 사용해 학습 의욕을 높인다.
- **손에 잡히는 조작감**: 부드러운 카드 표면, 누를 때 살짝 들어가는 상태 변화, 분명한 반응을 통해 종이 플래시카드와 학습 노트의 감각을 살린다.

## 색상
색상은 긴 학습 시간에도 읽기 편하고, 문법 요소를 구분하기 쉬우며, 기억 학습의 피로를 줄이도록 구성한다.

- **주 색상 (`#1E3A8A`)**: 깊은 네이비. 내비게이션, 주요 버튼, 레벨 표시, 화면의 기본 구조에 사용해 학습 도구로서 신뢰감을 준다.
- **보조 색상 (`#F43F5E`)**: 사쿠라 코랄. 연속 학습 기록, 시험 D-Day 알림, 복습 표시, 선택된 탭처럼 중요한 지점에 제한적으로 사용한다.
- **상태 색상 (`#10B981`)**: 에메랄드. 정답, 암기 완료, 정확도 그래프, 강의 완료 상태에만 사용한다.
- **주의 색상 (`#F59E0B`)**: 앰버. 불규칙한 억양, 혼동하기 쉬운 동음이의어, 후리가나 학습 힌트, 간격 복습 대기 항목을 강조한다.
- **중립 색상 (`#0F172A`)**: 짙은 잉크색. 일본어 한자와 한국어 주요 제목에 사용해 높은 대비를 확보한다. 부연 설명에는 `#475569`를 사용한다.
- **바탕색**: 기본 화면은 슬레이트 기운이 있는 밝은 `#F8FAFC`, 카드 표면은 `#FFFFFF`로 구분한다.

## 글꼴
한자·가나·한글과 영문 숫자가 함께 놓일 때 글자의 높이와 기준선이 어긋나지 않도록 글꼴과 행간을 정한다.

- **다국어 조화**: `Noto Sans`는 한자와 후리가나를 함께 표시해도 기준선이 자연스럽고 글자가 잘리지 않도록 한다. `Plus Jakarta Sans`는 숫자, D-Day, 화면 조작 요소에 사용한다.
- **후리가나 표시**: 문장 행간을 `38px`로 넉넉하게 잡아, 대상 한자 위 `2px`에 떠 있는 `11px` 후리가나가 다른 줄과 겹치거나 문단 높이를 흔들지 않도록 한다.
- **발음·번역 구분**: 한글 발음 안내와 번역 메모는 `body-md`의 `14px/22px` 규격과 낮은 채도의 슬레이트색을 사용해 일본어 원문과 구별한다.

## 배치와 간격
기준 모바일 화면 너비는 `390px`이며, 이동 중 한 손으로 공부하기 편하도록 설계한다.

- **열 구조**: 모바일은 4열 유동형 그리드를 사용하며 화면 바깥 여백은 `margin: 1.25rem`(20px), 열 사이 간격은 `gutter: 1rem`(16px)이다.
- **세로 학습 리듬**:
  - `space-xs`(4px): 후리가나와 한자를 가깝게 묶는다.
  - `space-sm`(8px): 문법 분해 화면에서 문장 요소를 구분한다.
  - `space-md`(16px): 카드 안쪽 여백과 문제·선택지 사이 간격에 사용한다.
  - `space-lg`(24px): 단어 복습 묶음과 문법 설명 영역을 구분한다.
  - `space-xl`(32px): 퀴즈 영역과 하단 조작 버튼을 분리한다.
- **하단 안전 영역**: 반복해서 누르는 학습 버튼은 기기 내비게이션 바 위에 `space-lg`만큼 여유를 둔다.

## 높이감과 깊이
한자 획을 읽는 데 방해가 되지 않도록 강한 그림자 대신 은은한 색 차이와 얕은 그림자로 영역을 구분한다.

- **0단계 바탕면**: 화면 전체 배경은 `#F8FAFC`이다.
- **1단계 학습 카드**: 흰색(`#FFFFFF`) 카드에 `1px` 테두리 `#E2E8F0`와 은은한 그림자 `0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.03)`를 적용한다.
- **2단계 대화형 요소·모달**: 떠 있는 퀴즈 선택지와 바텀 시트에는 `0 12px 24px -6px rgba(30, 58, 138, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)` 그림자를 사용한다.
- **누름 반응**: 선택지를 누르면 `translateY(2px)` 이동과 안쪽 테두리 색상 변화를 적용해 소리나 진동 반응 전에 입력이 인식되었음을 보여준다.

## 형태
전체적으로 부드러운 모서리를 사용하되, 정보의 구조는 명확하게 유지한다.

- **카드 (`rounded-xl` / 1.5rem, 24px)**: 플래시카드, 문법 분석 카드, 음성 예문 카드에 넉넉한 둥근 모서리를 적용해 각각의 학습 영역을 분명히 한다.
- **조작 요소 (`rounded-lg` / 1rem, 16px)**: 퀴즈 선택지, 문법 탭, 입력 필드는 엄지로 누르기 쉬운 둥근 모서리를 사용한다.
- **배지와 작은 칩 (`rounded-full`)**: 레벨(`N3`, `N4`, `N5`), 후리가나 전환 버튼, D-Day 표시는 완전히 둥글게 만들어 카드 본문과 구별한다.

## 구성 요소

### 버튼과 정답 선택지
- **주요 행동 버튼**: 깊은 네이비(`#1E3A8A`) 바탕에 흰색 글자를 쓰며 높이는 52px, 모서리 반경은 16px이다. 누르면 크기를 `0.98`배로 줄여 반응을 보여준다.
- **정답 선택지**: 최소 높이 56px, 흰색(`#FFFFFF`) 바탕, `#E2E8F0` 색상의 1.5px 테두리를 사용한다. 선택 후 상태는 다음과 같다.
  - *정답*: 테두리를 `#10B981`, 바탕을 `#ECFDF5`로 바꾸고 오른쪽에 확인 아이콘을 표시한다.
  - *오답*: 테두리를 `#F43F5E`, 바탕을 `#FFF1F2`로 바꾸고 가벼운 진동을 준다.
- **음성 재생 버튼**: 지름 44px의 `#EFF6FF` 원형 버튼에 `#1E3A8A` 스피커 아이콘을 넣고, 원어민 발음을 재생하는 동안 원형 파동을 표시한다.

### 칩과 배지
- **JLPT 레벨 표시**: `N3`는 `#1E3A8A` 바탕과 굵은 흰색 11px 글자를 사용한다. 낮은 단계의 표시에는 밝은 슬레이트색 `#F1F5F9` 바탕과 어두운 글자를 사용한다.
- **후리가나·로마자 전환**: `#E2E8F0` 바탕의 분할 버튼을 사용하며, 활성 항목은 `#FFFFFF` 표면과 부드러운 스프링 움직임으로 구분한다.
- **시험 D-Day 칩**: 밝은 사쿠라 코랄 바탕(`#FFE4E6`)과 진한 코랄 글자(`#BE123C`)로 긴박감은 전달하되 부담스럽지 않게 표시한다.

### 문제와 문장 카드
- **한자 집중 카드**: 주요 한자를 가운데에 48px로 표시하고 필요할 때 위에 후리가나를 고정한다. 아래의 펼침 영역에서는 음독과 훈독을 `#F1F5F9` 색상의 1px 세로선으로 구분한다.
- **문장 성분 분석**: 조사(は, が, を, に) 아래에 개별 강조 표시를 두고, 한 번 누르면 문맥에 따른 한국어 뉘앙스를 설명하는 도움말을 띄운다.

### 학습 진도와 연속 학습
- **선형 진도 막대**: 높이 8px의 완전히 둥근 막대다. 비활성 영역은 `#E2E8F0`, 채워지는 영역은 문제 완료에 따라 `#3B82F6`에서 `#10B981`로 이어지는 움직이는 그라데이션을 사용한다.
- **일일 목표 표시**: 선 두께 6px의 원형 진도 표시로 한 번의 학습에서 목표한 단어 수를 추적한다.

---

## Stitch 동기화 메모

- 이 파일의 위쪽 `Japanese Learning System`은 2026-10-03에 Stitch 프로젝트 `projects/616343586473997741`에서 가져온 **이전 파란색 디자인의 보관용 스냅샷**이다. 현재 화면 구현의 기준으로 사용하지 않는다.
- 2026-10-04에 파란색 시스템을 화면 4개에 적용한 것은 잘못된 변경이었다. 사용자 요청에 따라 앱의 분홍·크림 스타일을 복구하고 Stitch 화면 4개에 기존 `Calm Japanese Study Sanctuary` 시스템(`assets/7f3204a2a74a48819b5a25185f9e4788`)을 다시 적용했다.
- 현재 방향은 따뜻한 아이보리 배경(`#FAF9F6`), 흰색 카드, 사쿠라 분홍 강조 색상이다. 원본 Stitch 화면은 보관되어 있지만 MCP에서 화면 인스턴스를 원본 소스에 직접 다시 연결하는 기능은 제공되지 않아, 이번 Stitch 복구는 기존 따뜻한 디자인 시스템을 다시 적용한 결과다.
- Stitch 프로젝트의 전역 `designTheme`에는 아직 이전 파란색 토큰이 남아 있다. 향후 화면 변경 시 위쪽 보관 문서나 전역 토큰을 현재 기준으로 오해하지 않도록 확인한다. 이 문서의 내용은 추후 변경될 수 있다.
