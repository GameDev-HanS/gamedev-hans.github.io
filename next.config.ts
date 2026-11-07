import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 배포용 정적 내보내기 (빌드 결과: out/)
  output: "export",
  // 프로젝트 사이트(user.github.io/repo)일 때 GitHub Actions가 값을 넣어 줌. 사용자 사이트는 빈 값.
  basePath: process.env.PAGES_BASE_PATH,
  // 정적 내보내기에서는 이미지 최적화 서버가 없으므로 원본 이미지 사용
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
