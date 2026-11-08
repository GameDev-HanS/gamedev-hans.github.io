import type { MDXComponents } from "mdx/types"

// MDX 본문에 쓰는 전역 컴포넌트 (App Router에서 @next/mdx를 쓰려면 이 파일이 반드시 있어야 함).
// 제목·링크·이미지 등의 스타일은 T-113에서 추가합니다.
const components: MDXComponents = {}

export function useMDXComponents(): MDXComponents {
  return components
}
