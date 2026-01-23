import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // Prettier
      'prettier/prettier': 'error',

      // Import 정렬
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      // 미사용 import 제거
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // 일반 규칙
      'no-console': 'warn',
      'prefer-const': 'error',

      // TypeScript (기본 규칙 비활성화 - unused-imports가 대체)
      '@typescript-eslint/no-unused-vars': 'off',

      // React Hooks (폼 초기화 등 의도적인 경우 허용)
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Prisma generated
    'src/generated/**',
  ]),
])

export default eslintConfig
