# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

**모든 소통(답변, 질문, 보고, 커밋 메시지, 코드 주석)은 한국어로 합니다.**

# 프로젝트 개요

GitHub Pages(`https://gamedev-hans.github.io`)에 배포하는 Next.js 16 정적 사이트 스타터킷입니다. TypeScript, Tailwind CSS v4, shadcn/ui(Base UI 기반)를 씁니다. 사이트 문구는 한국어이고 `<html lang="ko">`입니다.

# 명령어

```powershell
npm run dev            # 개발 서버 (http://localhost:3000)
npm run build          # 정적 빌드 → out/
npm run lint           # ESLint (eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit       # 타입 검사
```

- 단위 테스트 프레임워크는 없습니다. 테스트는 `/test`(Playwright MCP로 브라우저 확인)로 합니다.
- `output: "export"`라서 `npm run start`(next start)는 쓰지 않습니다. 빌드 결과는 `out/` 폴더를 정적 서버로 확인합니다.
- shadcn 컴포넌트 추가: `npx shadcn@latest add <이름>` → `components/ui/`에 생성됩니다.
- 이 PC는 PATH에 git이 없을 수 있습니다. 없으면 `$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`를 씁니다.

# 아키텍처

## 정적 내보내기 제약

[next.config.ts](next.config.ts)의 `output: "export"` 때문에 서버 기능을 쓸 수 없습니다.
- 서버 액션, `cookies()`/`headers()`, API 라우트, 이미지 최적화(`images.unoptimized: true`)는 불가합니다.
- 동적 라우트에는 `generateStaticParams`가 필요합니다.
- 메타데이터 라우트([app/robots.ts](app/robots.ts), [app/sitemap.ts](app/sitemap.ts))에는 `export const dynamic = "force-static"`가 필요합니다.
- `basePath`는 `PAGES_BASE_PATH` 환경 변수에서 옵니다. CI가 넣어 주고, 사용자 사이트(`user.github.io`)라 지금은 비어 있습니다. 경로는 하드코딩하지 말고 `next/link`를 씁니다.
- 폼은 서버로 보내지 않고 클라이언트에서만 처리합니다 (예: [example-form.tsx](components/sections/example-form.tsx)는 zod 검증 후 toast만 띄움).

## 사이트 설정 한 곳에서 관리

[config/site.ts](config/site.ts)의 `siteConfig`가 이름, 설명, URL, 메뉴를 가집니다. `mainNav` 하나로 데스크톱 메뉴, 모바일 메뉴, sitemap이 함께 만들어집니다. **새 페이지를 만들면 `app/<경로>/page.tsx`를 추가하고 `mainNav`에 등록합니다.** 레이아웃 메타데이터(`title.template`, OpenGraph)도 여기 값을 씁니다.

## 컴포넌트 계층

`ui` ← `layout`/`shared` ← `sections` ← `app` 순서로만 import합니다 (아래 층이 위 층을 import하면 안 됨).
- `components/ui/` — shadcn 생성 컴포넌트. 직접 수정은 최소화합니다.
- `components/layout/` — 헤더, 푸터, 내비게이션, `Container`
- `components/shared/` — 여러 페이지에서 쓰는 조각 (`PageHeader`, `Section`, `ThemeToggle`)
- `components/sections/` — 페이지를 이루는 큰 블록 (`Hero`, `Features`, `ExampleForm` 등)
- `components/providers/` — 클라이언트 Provider (next-themes)
- `app/*/page.tsx`는 섹션을 조립만 합니다.

[app/layout.tsx](app/layout.tsx)가 `ThemeProvider` → `TooltipProvider` → 헤더/본문/푸터/`Toaster`를 감쌉니다. `"use client"`는 상호작용이 필요한 컴포넌트에만 붙입니다.

## shadcn/ui는 Base UI 기반

[components.json](components.json)의 스타일이 `base-lyra`라서 Radix가 아닌 `@base-ui/react` 위에 만들어져 있습니다.
- 다른 요소로 렌더링할 때 `asChild` 대신 `render` prop을 씁니다: `<NavigationMenuLink render={<Link href="/" />}>`
- `Select`는 `items`를 받고 값이 없으면 `null`입니다.
- 폼은 `Field`/`FieldLabel`/`FieldError` + react-hook-form `Controller` + `aria-invalid` 패턴을 따릅니다.
- `cn`은 npm 패키지 `cn`입니다 ([lib/utils.ts](lib/utils.ts)가 다시 내보냄).

## 스타일

Tailwind v4이고 별도 config 파일이 없습니다. 테마 변수와 다크 모드(`.dark` 클래스)는 [app/globals.css](app/globals.css)에서 관리합니다. PostCSS 대신 `next.config.ts`의 Turbopack 규칙(`@tailwindcss/turbopack`)으로 CSS를 처리합니다.

## 배포 (CI)

[.github/workflows/deploy.yml](.github/workflows/deploy.yml): `main`에 푸시하면 gitleaks 비밀값 검사 → `npm ci` → `npm audit --omit=dev --audit-level=high` → 빌드 → GitHub Pages 배포 순서로 진행합니다. PR에서는 검사와 빌드만 합니다. 운영 의존성에 high 이상 취약점이 있으면 배포가 멈춥니다. Action은 커밋 해시로 고정되어 있습니다. Dependabot이 npm과 Actions 업데이트를 매주 PR로 올립니다.

# 작업 흐름

## 1. 기능 개발: 플랜 → 코드 작성 → 코드 리뷰

1. **플랜 모드 (사용자와 상호작용)**: 코드를 쓰기 전에 요구사항과 구현 방법을 사용자와 정합니다. 애매한 결정은 AskUserQuestion으로 묻고, 승인을 받은 뒤 진행합니다.
2. **코드 작성 (Claude)**: 승인된 플랜대로 구현합니다. Next.js 16 API는 `node_modules/next/dist/docs/`를 먼저 확인합니다.
3. **코드 리뷰 (서브에이전트 + Discord 알림)**
   - 작업을 마치려 할 때 리뷰하지 않은 변경이 있으면 Stop 훅([.claude/hooks/request-code-review.ps1](.claude/hooks/request-code-review.ps1))이 리뷰를 요청합니다.
   - `code-reviewer` 서브에이전트([.claude/agents/code-reviewer.md](.claude/agents/code-reviewer.md))를 포그라운드로 실행합니다. 보고만 하고 파일은 바꾸지 않습니다.
   - 결과를 사용자에게 짧게 보고하고, 문제가 있으면 고칠지 묻습니다. 코드는 사용자가 요청할 때만 고칩니다.
   - Discord 알림: `powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type review -Status <passed|blocked|failed> -Detail "<요약>"` (저장소 루트에서 실행)

## 2. 커밋: /commit → 개인정보 검사 → 커밋 → (사용자) 푸시

1. **`/commit` (사용자가 실행)**: [.claude/commands/commit.md](.claude/commands/commit.md)
2. **개인정보 위험 확인**: 스테이징 후 `privacy-guard` 서브에이전트([.claude/agents/privacy-guard.md](.claude/agents/privacy-guard.md))로 검사합니다. 건너뛸 수 없습니다. 위험이 있으면 "위험 파일 제외 후 커밋 / 그대로 커밋 / 취소"를 사용자가 고릅니다.
3. **커밋**: Claude Code의 PreToolUse 훅([.claude/hooks/require-privacy-check.ps1](.claude/hooks/require-privacy-check.ps1), git의 pre-commit 훅이 아님)이 `git commit` 직전에 gitleaks([.gitleaks.toml](.gitleaks.toml))로 한 번 더 검사하고 사용자 승인을 받습니다. `git add`와 커밋을 한 명령에 섞거나 `--no-verify`를 쓰면 훅이 막습니다. 결과는 Discord로 알립니다 (`-Type commit`).
4. **푸시 (사용자)**: Claude는 푸시하지 않습니다. 사용자가 GitHub Desktop에서 직접 푸시합니다.

## 3. 테스트 자동화: /test (Playwright MCP)

- `/test`([.claude/commands/test.md](.claude/commands/test.md))는 Playwright MCP([.mcp.json](.mcp.json))로 브라우저를 열어 페이지, 내비게이션, 테마 전환, 폼, 모바일 화면, 콘솔 오류를 확인하고 보고합니다.
- `/test <페이지나 기능>`으로 범위를 좁힐 수 있습니다. 스크린샷은 `%TEMP%\playwright-mcp`에 저장됩니다.
- 테스트만 하고, 코드는 사용자가 요청할 때만 고칩니다.

# 공통 원칙

- **개인정보 보호가 편의보다 우선**입니다. 비밀값(예: `DISCORD_WEBHOOK_URL`)은 환경 변수로만 다룹니다.
- 유틸리티는 직접 구현하지 않고 검증된 라이브러리를 씁니다 (next-themes, react-hook-form + zod, sonner, lucide-react 등).
- `.claude/`의 공유 설정(commands, agents, hooks, scripts, settings.json)은 저장소에 커밋하고, 개인 설정인 `.claude/settings.local.json`만 제외합니다.
