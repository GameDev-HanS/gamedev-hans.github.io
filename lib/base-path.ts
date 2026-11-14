import { siteConfig } from "@/config/site"

// basePath(프로젝트 사이트 user.github.io/<repo>일 때 "/<repo>") 처리.
// next/link 이동은 Next가 알아서 붙이지만, next/image src·일반 <img>·<audio>·메타데이터 절대 주소에는
// 붙지 않으므로 이 파일의 값을 씁니다 (node_modules/next/dist/docs/.../basePath.md "Images").
// PAGES_BASE_PATH는 빌드 시 서버에서만 읽히는 값이라 서버 컴포넌트·lib에서만 쓰세요
// (클라이언트 컴포넌트에서 직접 쓰면 빈 값이 됨 — 필요하면 서버에서 계산한 경로를 props로 넘김).
export const basePath = process.env.PAGES_BASE_PATH ?? ""

/** public/ 파일 경로("/images/...")에 basePath를 붙입니다. 외부 주소("https://", "//")·상대 경로는 그대로 둡니다. */
export function withBasePath(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `${basePath}${path}` : path
}

/** basePath까지 포함한 사이트 전체 주소 (metadataBase·sitemap·robots용) */
export const siteUrl = `${siteConfig.url}${basePath}`
