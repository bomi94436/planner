# Frontend

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.1 |
| 언어 | TypeScript | 5.x |
| 스타일링 | Tailwind CSS | 4.x |
| UI 컴포넌트 | shadcn/ui (Radix UI) | - |
| 상태 관리 | Zustand | 5.x |
| ORM | Prisma | 7.2.0 |
| DB | PostgreSQL | - |
| Validation | Zod | 4.x |
| 날짜 처리 | dayjs | - |

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # 린트 검사
npm run lint:fix # 린트 자동 수정
```

## Prisma 명령어

### 자주 사용하는 명령어

```bash
# Prisma Client 생성 (스키마 변경 후 필수)
npx prisma generate

# 마이그레이션 생성 및 적용 (개발 환경)
npx prisma migrate dev --name <마이그레이션_이름>

# 마이그레이션 적용 (프로덕션 환경)
npx prisma migrate deploy

# DB 스키마 직접 반영 (마이그레이션 없이, 개발용)
npx prisma db push

# Prisma Studio 실행 (DB GUI)
npx prisma studio
```

### 기타 명령어

```bash
# DB 시드 데이터 삽입
npx prisma db seed

# 마이그레이션 상태 확인
npx prisma migrate status

# DB 스키마를 schema.prisma로 가져오기 (기존 DB 연동 시)
npx prisma db pull

# 마이그레이션 초기화 (주의: 데이터 손실)
npx prisma migrate reset
```

### 스키마 변경 워크플로우

1. `prisma/schema.prisma` 수정
2. `npx prisma migrate dev --name <설명>` 실행
3. 자동으로 `npx prisma generate` 실행됨
4. 코드에서 변경된 타입 사용

### Prisma Client 경로

```typescript
import { PrismaClient } from '@/generated/prisma/client'
```

### 네이밍 컨벤션

- **DB 컬럼**: `snake_case` (예: `start_timestamp`, `created_at`)
- **Prisma 모델**: `camelCase` (예: `startTimestamp`, `createdAt`)

`@map()` 데코레이터를 사용하여 DB 컬럼명과 Prisma 필드명을 매핑합니다.
