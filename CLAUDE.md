# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

**모든 소통(답변, 질문, 보고, 커밋 메시지, 코드 주석)은 한국어로 합니다.**

# 프로젝트 개요

GitHub Pages(`https://gamedev-hans.github.io`)에 배포하는 Next.js 16 정적 사이트 스타터킷입니다. TypeScript, Tailwind CSS v4, shadcn/ui(Base UI 기반)를 쓰고, 사이트 문구는 한국어입니다.

# 명령어

```powershell
npm run dev            # 개발 서버 (http://localhost:3000)
npm run build          # 정적 빌드 → out/
npm run lint           # ESLint
npx tsc --noEmit       # 타입 검사
npx shadcn@latest add <이름>   # components/ui/에 컴포넌트 추가
```

- 단위 테스트는 없고 `/test`(Playwright MCP)로 확인합니다. `npm run start`는 쓰지 않습니다 (정적 내보내기).
- PATH에 git이 없으면 `$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`를 씁니다.

# 아키텍처

## 정적 내보내기 제약

[next.config.ts](next.config.ts)의 `output: "export"` 때문에 서버 기능을 쓸 수 없습니다.
- 서버 액션, `cookies()`/`headers()`, API 라우트, 이미지 최적화는 불가합니다.
- 동적 라우트에는 `generateStaticParams`, 메타데이터 라우트([robots.ts](app/robots.ts), [sitemap.ts](app/sitemap.ts))에는 `export const dynamic = "force-static"`가 필요합니다.
- `basePath`는 `PAGES_BASE_PATH` 환경 변수에서 옵니다 (지금은 비어 있음). 경로는 하드코딩하지 말고 `next/link`를 씁니다.
- 폼은 클라이언트에서만 처리합니다 ([example-form.tsx](components/sections/example-form.tsx): zod 검증 후 toast).

## 사이트 설정

[config/site.ts](config/site.ts)의 `siteConfig`가 이름, 설명, URL, 메뉴를 가지고, `mainNav`로 데스크톱·모바일 메뉴와 sitemap이 만들어집니다. **새 페이지는 `app/<경로>/page.tsx`를 추가하고 `mainNav`에 등록합니다.**

## 컴포넌트 계층

`ui` ← `layout`/`shared` ← `sections` ← `app` 순서로만 import합니다 (아래 층이 위 층을 import하면 안 됨).
- `components/ui/`: shadcn 생성 컴포넌트 (직접 수정 최소화)
- `components/layout/`: 헤더, 푸터, 내비게이션, `Container`
- `components/shared/`: 여러 페이지에서 쓰는 조각 (`PageHeader`, `Section`, `ThemeToggle`)
- `components/sections/`: 페이지를 이루는 큰 블록. `app/*/page.tsx`는 섹션을 조립만 합니다.
- `components/providers/`: 클라이언트 Provider (next-themes)

`"use client"`는 상호작용이 필요한 컴포넌트에만 붙입니다.

## shadcn/ui는 Base UI 기반

스타일이 `base-lyra`라서 Radix가 아닌 `@base-ui/react` 위에 만들어져 있습니다.
- `asChild` 대신 `render` prop을 씁니다: `<NavigationMenuLink render={<Link href="/" />}>`
- `Select`는 `items`를 받고 값이 없으면 `null`입니다.
- 폼은 `Field`/`FieldLabel`/`FieldError` + react-hook-form `Controller` + `aria-invalid` 패턴을 따릅니다.
- `cn`은 npm 패키지 `cn`입니다 ([lib/utils.ts](lib/utils.ts)).

## 스타일

Tailwind v4이고 config 파일이 없습니다. 테마 변수와 다크 모드(`.dark`)는 [app/globals.css](app/globals.css)에 있고, CSS는 PostCSS 대신 `next.config.ts`의 Turbopack 규칙으로 처리합니다.

## 배포 (CI)

[deploy.yml](.github/workflows/deploy.yml): `main` 푸시 시 gitleaks → `npm ci` → `npm audit --omit=dev --audit-level=high` → 빌드 → Pages 배포. PR은 검사와 빌드만 합니다. Action은 커밋 해시로 고정하고, Dependabot이 매주 업데이트 PR을 올립니다.

# 작업 흐름

| 단계 | 방법 | Discord 알림 |
|------|------|--------------|
| 기능 개발 | 플랜 모드에서 AskUserQuestion으로 정하고 승인 후 구현. Next.js 16 API는 `node_modules/next/dist/docs/`를 먼저 확인 | — |
| 코드 리뷰 | 작업 종료 시 Stop 훅이 요청 → `code-reviewer` 서브에이전트(포그라운드, 보고만) | `-Type review` |
| 커밋 | [/commit](.claude/commands/commit.md): `privacy-guard` 검사(생략 불가) → 커밋 | `-Type commit` |
| 테스트 | [/test](.claude/commands/test.md): Playwright MCP로 브라우저 확인 | `-Type test` |
| 통합 | [/commit-test](.claude/commands/commit-test.md): 보안 검사 → 테스트 → 커밋. 둘 다 통과해야 커밋하고, 중간에 멈추면 즉시 알림 | `-Type pipeline` |

- 알림: `powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type <종류> -Status <passed|blocked|failed> -Detail "<요약>"` (저장소 루트에서)
- 리뷰·테스트에서 문제를 찾아도 코드는 사용자가 요청할 때만 고칩니다.
- `git commit` 직전에 PreToolUse 훅([require-privacy-check.ps1](.claude/hooks/require-privacy-check.ps1))이 gitleaks 검사 후 승인을 받습니다. `git add`와 커밋을 한 명령에 섞거나 `--no-verify`를 쓰면 막힙니다.
- **Claude는 푸시하지 않습니다.** 사용자가 GitHub Desktop에서 푸시합니다.

# 공통 원칙

- **개인정보 보호가 편의보다 우선**입니다. 비밀값(예: `DISCORD_WEBHOOK_URL`)은 환경 변수로만 다룹니다.
- 유틸리티는 직접 만들지 않고 검증된 라이브러리를 씁니다 (next-themes, react-hook-form + zod, sonner, lucide-react 등).
- `.claude/`의 공유 설정은 커밋하고, 개인 설정 `.claude/settings.local.json`만 제외합니다.
