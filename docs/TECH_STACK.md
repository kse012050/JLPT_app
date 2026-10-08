# 일본어 학습 앱 기술 스택 및 라이브러리 결정

작성일: 2026-10-01  
상태: 기술 선택 기록. 아이콘은 첫 화면과 하단 탭에 적용했다. 설치된 패키지와 버전은 저장소 루트의 `package.json` 및 잠금 파일에서 확인한다. 첫 APK에 필요한 서버·인증 제공자는 미선정이다.
제품 기획: [japanese-study-app-plan.md](japanese-study-app-plan.md)

## 이 문서의 역할

이 파일은 **어떤 기술·라이브러리를 왜 선택했는지** 기록한다. 실제 설치 버전은 저장소 루트의 `package.json`과 잠금 파일에서 확인한다. 서버 데이터 구조와 출시 조건은 [데이터베이스 계획](DATABASE_PLAN.md)에 둔다. `AGENTS.md`는 AI가 코드를 수정할 때 따라야 할 작업 규칙에 사용한다.

## 확정한 선택

| 영역 | 선택 | 선택 이유 | 사용 시점 |
| --- | --- | --- | --- |
| 앱 기반 | React Native + Expo + TypeScript | 이전 React Native 개발 경험을 활용하고, 수업·문제 데이터의 형태를 명확히 정의 | 프로젝트 시작 |
| 화면 이동 | `expo-router` | Expo 새 프로젝트의 기본 구성. 파일 기반 경로로 탭·수업·문제 화면을 관리 | 프로젝트 시작 |
| 기기 내 영구 저장 | `expo-sqlite` | 내려받은 콘텐츠·일정과 수업 진도, 오답, 복습 예정 항목을 기기에 저장하고 조회 | 첫 APK |
| 공통 상태 | `@reduxjs/toolkit` + `react-redux` | 여러 화면에서 공유하는 학습·풀이 상태 관리 | 첫 버전 |
| 음성 파일 재생 | `expo-audio` | 검토한 예문·청해 음성 파일 재생 | 첫 버전 |
| 보조 음성 합성 | `expo-speech` | 음성 파일이 없는 일본어 텍스트를 보조적으로 읽기 | 기본 음성 흐름 이후 |
| 화면 구성 | React Native 기본 구성요소 + `StyleSheet` | 수업 카드와 문제 화면을 직접 구성하고 공통 컴포넌트로 재사용 | 첫 버전 |
| 아이콘 | `expo-symbols` (Google Material Symbols 기반) | Expo SDK 57과 호환되는 아이콘 라이브러리. Android·웹에서는 Google Material Symbols, iOS에서는 대응하는 SF Symbols를 표시 | 첫 버전 |
| 알림 | `expo-notifications` | 기기에서 공부·복습 알림 예약 | 복습 흐름 완성 이후 |

**첫 APK부터** 서버 DB, 계정 인증, 콘텐츠·시험 일정 API, 관리자 게시 화면, 학습 기록 동기화를 제공한다. 서버 관계형 DB는 PostgreSQL을 우선 후보로 두며 호스팅·인증 제품은 구현 전에 결정한다. 앱의 HTTP 통신은 우선 기본 `fetch`를 사용하고 추가 요청 라이브러리는 필요가 확인되면 선택한다. 검수한 시작 콘텐츠·음성은 APK에도 포함하고, 게시된 새 버전은 서버에서 받아 로컬에 보관한다. SQLite의 기록은 서버 계정에 동기화한다.

SQLite와 Redux는 역할이 다르다. SQLite는 앱을 종료해도 남는 기록을 저장한다. Redux는 실행 중 여러 화면이 공유할 학습 상태를 관리한다. 한 문장에서만 한글 발음을 펼치는 상태처럼 작은 화면 상태는 React `useState`로 처리한다. `expo-speech`의 음성 품질과 오프라인 사용 가능 여부는 기기 환경에 따라 달라질 수 있으므로 기본 발음·청해 수업은 검토한 음성 파일을 사용한다.

아이콘은 `expo-symbols`의 `SymbolView`에서 플랫폼별 이름을 지정한다. Android·웹에는 Google Material Symbols 이름(예: `home`, `menu_book`), iOS에는 같은 의미의 SF Symbols 이름(예: `house`, `book`)을 전달한다. 앱 폴더에 Expo SDK 57 권장 버전 `~57.0.3`이 설치되어 있으며, 첫 화면과 하단 탭에 적용했다. 이후 설치·버전 관리는 `npx expo install expo-symbols`로 한다. 일본어 학습 내용에 쓰이는 `あ`, `文`, 등급 표기 `N5` 등은 아이콘이 아닌 텍스트로 유지한다.

## 라우터 결정

**Expo Router를 사용한다.** Expo의 기본 프로젝트 구성에 포함되고, 수업 `lesson/[id]`와 문제 `quiz/[id]`를 파일 기반 경로로 표현하기 쉽다. React Navigation은 화면 구성을 코드에서 직접 정의하고 복잡한 이동 동작을 세밀하게 제어할 수 있는 대안이지만, 현재 계획한 화면 흐름에는 Expo Router가 더 단순하다. [Expo의 라우터 비교](https://docs.expo.dev/develop/app-navigation/)

화면 경로와 학습 기능은 분리한다. 수업 내용, 문제 채점, 복습 계산, SQLite 저장, API 통신은 `src/app/`의 화면 파일에 몰아넣지 않고 `src/features/`, `src/db/`, `src/api/`, `src/content/` 등으로 나눈다. 등급 `N3`을 코드의 고정 구조로 만들지 않고 수업·문제 데이터가 등급을 나타내도록 해 이후 N2 과정도 추가할 수 있게 한다.

## 도입 순서

1. Expo + TypeScript 프로젝트를 만들고 Expo Router로 기본 화면을 연결한다.
2. **완료:** `expo-symbols`를 설치하고 첫 화면·하단 탭의 아이콘에 적용했다.
3. 서버·인증 제품을 결정하고 DB, 관리자 게시, 콘텐츠·일정 API를 구현한다.
4. `expo-sqlite`, `expo-audio`를 도입해 게시 콘텐츠의 로컬 보관과 실제 학습 기록 저장을 구현한다. 필요한 공통 상태 관리 방식은 화면 흐름에 맞춰 검증한다.
5. 계정별 기록 동기화, 오프라인 재접속, 새 기기 복원을 연결한다.
6. 보조 읽어주기가 필요해지면 `expo-speech`를 연결하고 실기기에서 일본어 음성을 확인한다. 복습 시점이 정해지면 `expo-notifications`로 로컬 알림을 연결한다.
7. 첫 APK에서 서버 게시 → 앱 갱신, 로그인, 오프라인 학습, 재접속 후 기록 동기화를 확인한다. 모든 필수 항목을 갖춘 뒤 APK를 출시본으로 만든다.
8. 루트 `package.json`의 실제 패키지와 이 문서의 선택을 맞춰 유지한다.

## 공식 문서

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Symbols (SDK 57)](https://docs.expo.dev/versions/v57.0.0/sdk/symbols/)
- [Google Material Symbols](https://fonts.google.com/icons)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Redux Toolkit 및 React Redux 설치](https://redux.js.org/toolkit/introduction/getting-started)
- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
