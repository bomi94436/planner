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
│   │   ├── lib/           # 유틸리티 함수
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

### 커밋 전 체크리스트

코드 변경 후 커밋하기 전에 반드시 아래 3가지를 확인한다:

```bash
cd frontend
npm run lint     # 1. 린트 오류 없음
npm run build    # 2. 빌드 성공 확인
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

#### PR 내용 작성

사용자가 "PR 내용 작성해줘"라고 요청하면:

1. 현재 브랜치의 커밋 내역과 변경 사항을 분석한다
2. 아래 템플릿에 맞춰 markdown 파일을 작성한다
3. `~/Downloads/pr-<브랜치명>.md` 경로에 저장한다

```markdown
## 제목
<!-- 이 PR의 제목을 간단히 작성 -->

## 개요

<!-- 이 PR이 해결하는 문제 또는 추가하는 기능을 간단히 설명 -->

## 변경 사항

<!-- 주요 변경 내용을 목록으로 작성 -->

-

## 변경된 파일

<!-- 핵심 변경이 있는 파일만 작성 -->
<!-- 아래 파일은 제외: index.ts (export 파일), 미세 조정/사소한 스타일 변경, 라벨 변경 -->
<!-- frontend/ 폴더 내에서만 변경된 경우 'frontend/' 생략 -->

| 파일 | 변경 내용 |
| ---- | --------- |
|      |           |

## 스크린샷

<!-- UI 변경이 있는 경우 첨부 -->

## 테스트

<!-- 테스트 방법 또는 확인 사항 -->

- [ ] 린트 오류 없음
- [ ] 빌드 성공 확인
```

## 개발 명령어

```bash
cd frontend
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # 린트 검사
```
