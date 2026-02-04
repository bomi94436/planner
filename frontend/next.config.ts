import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Docker 프로덕션 빌드용
  turbopack: {
    rules: {
      '**/*.{tsx,jsx}': {
        loaders: [
          {
            loader: '@locator/webpack-loader',
            options: { env: 'development' },
          },
        ],
      },
    },
    resolveAlias: {
      '~/daily/*': './src/app/(app)/daily/*',
      '~/monthly/*': './src/app/(app)/monthly/*',
      '~/weekly/*': './src/app/(app)/weekly/*',
      '~/yearly/*': './src/app/(app)/yearly/*',
      '~/api/*': './src/app/api/*',
    },
  },
}

export default nextConfig
