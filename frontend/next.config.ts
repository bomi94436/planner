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
  },
}

export default nextConfig
