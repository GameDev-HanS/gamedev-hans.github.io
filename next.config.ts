import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 배포용 정적 내보내기 (빌드 결과: out/)
  output: "export",
  // 프로젝트 사이트(user.github.io/repo)일 때 GitHub Actions가 값을 넣어 줌. 사용자 사이트는 빈 값.
  basePath: process.env.PAGES_BASE_PATH,
  // 정적 내보내기에서는 이미지 최적화 서버가 없으므로 원본 이미지 사용
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// 블로그 글(content/posts/*.mdx)을 컴포넌트로 import할 수 있게 합니다.
// Turbopack에서는 플러그인을 문자열 이름으로만 지정할 수 있습니다 (함수 옵션 불가).
// - remark-frontmatter: 글 맨 위 YAML(제목·날짜 등)이 본문에 찍히지 않게 함 (값은 lib에서 gray-matter로 읽음)
// - remark-gfm: 표·취소선 등 GitHub 마크다운 문법
// - rehype-pretty-code: 코드 블록을 빌드 시 shiki로 하이라이트 (T-301).
//   라이트·다크 색을 함께 넣어 두고 globals.css에서 테마에 맞는 색을 고릅니다.
//   배경은 넣지 않고(패널은 components/shared/code-block.tsx), 인라인 코드는 건드리지 않습니다.
//   언어를 적지 않은 블록은 그대로 두고, shiki에 없는 언어는 하이라이트 없이 글자만 나옵니다.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [
      [
        "rehype-pretty-code",
        {
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
          bypassInlineCode: true,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
