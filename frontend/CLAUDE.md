# Frontend 컨벤션

## 폴더 구조

```
frontend/src/
├── app/                    # 페이지 및 API 라우트
│   ├── (app)/              # 앱 라우트 그룹
│   │   └── daily/          # 페이지 예시
│   │       ├── page.tsx
│   │       ├── _api/       # API 호출 함수
│   │       ├── _components/# 페이지 전용 컴포넌트
│   │       ├── _constants/ # 페이지 전용 상수
│   │       ├── _hooks/     # 페이지 전용 hooks
│   │       ├── _types/     # 페이지 전용 타입
│   │       └── _utils/     # 페이지 전용 유틸리티
│   └── api/                # API 라우트
│       ├── _lib/           # API 공통 유틸리티
│       └── _validations/   # zod 스키마
├── components/             # 공통 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   └── layout/             # 레이아웃 컴포넌트
├── hooks/                  # 공통 hooks
├── lib/                    # 유틸리티 함수
├── store/                  # 상태 관리 (zustand)
└── types/                  # 공통 타입 정의
```

## 페이지 컴포넌트 구조

### 기본 원칙

- `page.tsx`에서 사용하는 컴포넌트는 같은 수준의 `_components/` 폴더에 정의
- 특정 페이지에서만 사용되는 hook, type, util, constant는 해당 페이지 수준에서 `_` prefix 폴더로 정의
- 여러 페이지에서 공통으로 사용되는 것은 `/src` 하위에 정의

### 컴포넌트 트리 구조

컴포넌트가 하위 컴포넌트로 분리될 경우, 폴더 depth로 관계를 표현:

```
_components/
├── execution-table/           # 메인 컴포넌트 폴더
│   ├── index.tsx              # ExecutionTable (진입점)
│   ├── execution-block.tsx    # 하위 컴포넌트 (단일 파일)
│   └── grid-background.tsx
└── plan-list/
    ├── index.tsx
    └── plan-form-dialog/      # 더 분리가 필요한 하위 컴포넌트
        ├── index.tsx
        ├── plan-time-input.tsx
        └── plan-date-picker.tsx
```

**규칙:**
- 메인 컴포넌트는 `index.tsx`로 정의
- 단순한 하위 컴포넌트는 같은 폴더에 파일로 정의
- 하위 컴포넌트가 또 다른 컴포넌트를 가질 경우 하위 폴더로 분리

## API

### 클라이언트 API 호출 함수

페이지별 `_api/func.ts`에 axios를 사용하여 정의:

```typescript
// _api/func.ts
import axios from 'axios'
import { ExecutionsResponse, GetExecutionsQuery } from '@/types/execution'

export const getExecutions = async ({ startTimestamp, endTimestamp }: GetExecutionsQuery) => {
  const response = await axios.get<ExecutionsResponse>('/api/executions', {
    params: { startTimestamp, endTimestamp },
  })
  return response.data?.data
}

export const createExecution = async (data: CreateExecutionBody) => {
  const response = await axios.post<ExecutionResponse>('/api/executions', data)
  return response.data?.data
}

export const updateExecution = async (id: number, data: UpdateExecutionBody) => {
  const response = await axios.patch<ExecutionResponse>(`/api/executions/${id}`, data)
  return response.data?.data
}

export const deleteExecution = async (id: number) => {
  const response = await axios.delete<ExecutionResponse>(`/api/executions/${id}`)
  return response.data?.data
}
```

### API 라우트 작성 규칙

**1. Swagger 문서화 (권장)**

```typescript
/**
 * @swagger
 * /api/executions:
 *   get:
 *     tags:
 *       - Execution
 *     summary: Execution 목록 조회
 *     description: Execution 목록을 조회합니다.
 */
```

**2. GET 요청 시 select 필드 명시**

필요한 필드만 선택하여 응답 크기 최적화:

```typescript
const executions = await prisma.execution.findMany({
  where: { ... },
  select: {
    id: true,
    title: true,
    startTimestamp: true,
    endTimestamp: true,
  },
})
```

**3. withErrorHandler 래퍼 사용**

```typescript
export const GET = withErrorHandler(async (request) => {
  // ...
})
```

**4. zod를 이용한 validation**

```typescript
import { createExecutionSchema } from '../_validations'

const validated = createExecutionSchema.parse(body)
```

## Import 경로 별칭

```typescript
// 공통 (src 하위)
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useDateStore } from '@/store'
import type { Execution } from '@/types/execution'

// 페이지 전용 (현재 페이지 하위)
import { TOTAL_HOURS } from '~/daily/_constants'
import { useCurrentTime } from '~/daily/_hooks'
import type { Minutes } from '~/daily/_types'
import { formatHour } from '~/daily/_utils'
```

## 폴더별 index.ts export 패턴

각 폴더의 `index.ts`에서 re-export:

```typescript
// _hooks/index.ts
export * from './use-current-time'
export * from './use-selection'

// components/ui/index.ts
export * from './button'
export * from './card'
```
