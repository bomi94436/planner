# Planner 프로젝트

## 프로젝트 개요

아날로그 플래너를 디지털로 옮긴 개인 생산성 앱입니다.

### 주요 기능

- **플래너**: 일간/주간/월간 일정 관리
- **타임 트래커**: 시간 사용 기록 및 분석
- **해빗 트래커**: 습관 형성 및 추적

## 기술 스택

Next.js 풀스택 애플리케이션

| 영역        | 기술                                |
| ----------- | ----------------------------------- |
| 프레임워크  | Next.js (App Router)                |
| 언어        | TypeScript                          |
| 스타일링    | Tailwind CSS v4                     |
| UI 컴포넌트 | shadcn/ui                           |
| API         | Next.js API Routes / Server Actions |

## 프로젝트 구조

```
planner/
├── frontend/
│   ├── src/
│   │   ├── app/           # 페이지 및 API 라우트
│   │   ├── components/    # UI 컴포넌트
│   │   ├── config/        # 외부 라이브러리 설정 (auth, prisma, swagger)
│   │   ├── utils/         # 순수 유틸리티 함수
│   │   └── types/         # 타입 정의
│   └── public/            # 정적 파일
└── CLAUDE.md
```

## 공통 규칙

### 문서 작성

- 모든 문서는 **한글**로 작성한다
- 코드 주석은 한글로 작성한다
- 커밋 메시지는 한글로 작성한다

### 네이밍 컨벤션

- 파일명: `kebab-case` (예: `time-tracker.tsx`)
- 컴포넌트: `PascalCase` (예: `TimeTracker`)
- 함수/변수: `camelCase` (예: `getHabitList`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_HABITS`)

### 커밋 메시지

```
<타입>: <설명>

예시:
feat: 해빗 트래커 추가
fix: 플래너 날짜 선택 버그 수정
refactor: 타임 트래커 컴포넌트 분리
```

타입: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf`

#### 설명 작성 원칙

설명은 **코드 변경 내용이 아닌 기능/동작 관점**으로 서술한다.

```
좋은 예: fix: 22:00~00:00 selection 후 종료일이 다음날로 설정되지 않는 버그 수정
나쁜 예: fix: minutesToDayjs에서 % HOURS_PER_DAY를 dayOffset 계산으로 변경
```

### 커밋 전 체크리스트

코드 변경 후 커밋하기 전에 반드시 아래 3가지를 확인한다:

```bash
cd frontend
npm run test     # 1. 테스트 통과 확인
npm run lint     # 2. 린트 오류 없음
npm run build    # 3. 빌드 성공 확인
```

모든 항목이 통과해야 커밋을 진행한다.

### 브랜치 전략 (GitHub Flow)

```
main (프로덕션)
  └── feature/daily-planner
  └── feature/habit-tracker
  └── fix/date-picker-bug
```

#### 브랜치 명명 규칙

- 브랜치명은 **영어**로 작성한다
- `feature/<기능명>`: 새 기능 개발
- `fix/<버그명>`: 버그 수정
- `refactor/<대상>`: 리팩토링
- `docs/<문서명>`: 문서 작업

#### 워크플로우

1. `main`에서 새 브랜치 생성
2. 작업 후 커밋
3. **PR 생성 후 main에 merge** (직접 push 금지)
4. merge 후 브랜치 삭제

### PR 작성 가이드

PR 작성 시 `.github/pull_request_template.md` 템플릿을 사용한다.

#### 개요

- PR 전체를 한 문장으로 요약한다
- 무엇을 왜 만들었는지 명확히 드러나야 한다

```
예시: Habit Tracker 페이지 구현 (schema → API → UI)
```

#### 변경 사항 섹션

- 구현한 기능을 **논리적 단위**로 나눠 섹션별로 작성한다
- 섹션 순서는 의존 관계 순서를 따른다 (예: schema → API → UI)
- 섹션명은 구체적으로 작성한다

```
좋은 예: Habit Schema 정의
나쁜 예: 백엔드 작업
```

각 섹션은 **변경 내용**과 **변경 파일** 두 파트로 구성한다.

**변경 내용**: 추가/수정/삭제된 기능을 bullet로 나열한다

```markdown
- (추가) 습관 CRUD 기능
- (수정) 습관 달성 시 연속일 계산 로직
- (삭제) 레거시 습관 상태 관리 방식
```

**변경 파일**: 핵심 변경 파일만 테이블 형식으로 작성한다

- 전체 파일 나열 금지, 설정 파일·lock 파일 등 부수적인 변경은 생략
- 경로는 프로젝트 루트 기준으로 작성

```markdown
| 파일 | 설명 |
| ---- | ---- |
| `frontend/src/app/api/habits/route.ts` | 습관 CRUD API 구현 |
| `frontend/src/types/habit.ts` | Habit, HabitLog 타입 정의 |
```

#### 스크린샷

- UI 변경이 포함된 경우 반드시 첨부한다
- Before / After가 있으면 비교해서 첨부한다

## 테스트 코드 작성 규칙

### 환경

- 테스트 프레임워크: Vitest (`globals: false` → 모든 API를 명시적으로 import)
- 테스트 파일명: `*.test.ts` (테스트 대상 파일과 같은 폴더)

```typescript
import { describe, expect, it } from 'vitest';
```

### 파일 구조

- 테스트 파일은 대상 파일과 같은 폴더에 위치한다
- 파일명: `<대상파일명>.test.ts` (예: `index.ts` → `index.test.ts`)

### 테스트 케이스 작성

- `describe`로 함수 단위 그룹핑
- `it` 설명은 **한글**로 작성하며, 입력 → 기대값을 명시한다

```typescript
// 좋은 예
it('hourIndex=0 → "04"', () => { ... })
it('시작과 끝이 동일한 블럭은 endIndex를 startIndex+1로 보정한다', () => { ... })
```

### 기준 상수 주석

`describe` 블록 위에 테스트 케이스 계산의 기준이 되는 상수를 주석으로 명시한다.
하드코딩된 기대값이 어떻게 도출되었는지 이해할 수 있도록 한다.

```typescript
// hourIndex=1 기준: minutesStart=60, minutesEnd=120
describe('getTimeBlocksForRow', () => { ... })

// START_HOUR=4, HOURS_PER_DAY=24, MINUTES_PER_HOUR=60, ROW_HEIGHT=32
describe('getPositionFromCoordinates', () => { ... })
```

파일 전체에 걸쳐 공통으로 적용되는 상수는 파일 상단에 한 번만 작성한다.

### Date 생성 방식

`Date` 객체를 생성할 때는 문자열 방식 대신 **생성자 방식**을 사용한다.

- 문자열 방식(`'2024-01-01T04:00:00'`)은 ECMAScript 스펙상 파싱 기준이 구현체에 따라 달라질 수 있어 UTC 환경(CI 서버 등)에서 테스트가 깨질 수 있다
- 생성자 방식은 항상 로컬 시간으로 처리되도록 스펙에 명확히 정의되어 있다

```typescript
// ❌ 문자열 방식 (CI 환경에서 깨질 수 있음)
new Date('2024-01-01T04:00:00');

// ✅ 생성자 방식 (항상 로컬 시간 보장)
new Date(2024, 0, 1, 4, 0, 0);
```

### 픽스처 및 헬퍼

반복되는 테스트 데이터는 `describe` 블록 내부에 헬퍼 함수나 상수로 정의한다.

```typescript
describe('getTimeBlocksForRow', () => {
  const makeBlock = (startIndex: number, endIndex: number): ProcessedTimeBlock<SimpleBlock> => ({
    item: { startTimestamp: new Date(), endTimestamp: new Date() },
    startIndex,
    endIndex,
  });
  // ...
});
```

### 실행 명령어

```bash
cd frontend
npm run test          # 전체 테스트 실행 (watch 모드)
npm run test:ui       # Vitest UI로 실행
npx vitest run        # watch 없이 1회 실행
npx vitest run <파일> # 특정 파일만 1회 실행
```

## 개발 명령어

```bash
cd frontend
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # 린트 검사
```
