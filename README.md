# HanS Dev Log

게임 개발자의 개인 블로그입니다. 운영자 소개, 개발 기록(글·사진·영상), 플레이한 게임 기록을 한곳에 모았습니다.

- 사이트: https://gamedev-hans.github.io
- 배포: GitHub Pages (정적 사이트)

기획·구현·리뷰·테스트·커밋 전 과정을 **Claude Code**와 함께 진행했습니다. 직접 만든 슬래시 명령어, 서브에이전트, 훅으로 작업 흐름을 자동화했습니다 ([아래](#claude-code로-개발한-방식) 참고).

## 주요 기능

| 영역 | 내용 |
|------|------|
| 홈 | 히어로, 프로필, 기술 스택 배지(브랜드 아이콘), 경력·학력, 자격증, 최근 글 |
| 블로그 | MDX 글 목록·상세, 태그별 목록, 이전/다음 글, 코드 블록 하이라이트(빌드 시) |
| 게임 | 연도별 JSON 기록, 전체 보기·연도별 보기, 상태별 묶음, 공식 PV 팝업 재생 |
| 테마 | 블랙 + 시안 1색, 다크 기본·라이트 전환, WCAG AA 대비 |
| 연출 | 헤더 차례 등장, 스크롤 등장, 카드 호버 떠오름·기울기, "GAME OVER" 404 |
| 배경 음악 | 헤더 버튼으로 켜고 끔, 페이지를 옮겨도 이어서 재생, 출처·라이선스 표시 |
| 검색 엔진 | sitemap, robots, 페이지별 title·description·canonical·OG 정보 |

모든 애니메이션은 운영체제의 "동작 줄이기" 설정을 따릅니다.

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router, `output: "export"` 정적 내보내기), React 19 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4, `@tailwindcss/typography` |
| UI 컴포넌트 | shadcn/ui (Base UI 기반), lucide-react, simple-icons |
| 콘텐츠 | MDX (`@next/mdx`, gray-matter, remark-gfm), rehype-pretty-code + shiki |
| 데이터 검증 | zod (글 frontmatter, 소개·게임·음악 JSON — 잘못되면 빌드 실패) |
| 애니메이션 | Motion (`motion/react`) |
| 테마 | next-themes |
| 배포·CI | GitHub Actions → GitHub Pages, gitleaks, `npm audit`, Dependabot |

서버가 없는 정적 사이트라서 모든 콘텐츠는 저장소 파일이고, 빌드할 때 읽어서 HTML로 만듭니다.

## 폴더 구조

```
app/                 페이지 (홈, blog, games, 404, sitemap, robots)
components/
  ui/                shadcn 컴포넌트
  layout/            헤더, 푸터, 내비게이션
  shared/            여러 페이지가 함께 쓰는 조각 (카드, 태그, 애니메이션 래퍼)
  sections/          페이지를 이루는 큰 블록
  providers/         테마, 애니메이션, 배경 음악 Provider
content/             글(posts/*.mdx), 소개·게임·태그·음악 JSON
lib/                 콘텐츠 로더(zod 검증), 메타데이터, 애니메이션 상수
config/site.ts       사이트 이름·설명·메뉴
.claude/             Claude Code 명령어·에이전트·훅·계획 문서
```

## Claude Code로 개발한 방식

반복되는 작업을 Claude Code 설정으로 만들어 두고, 명령어 하나로 실행했습니다.

### 슬래시 명령어 (`.claude/commands/`)

| 명령어 | 하는 일 |
|--------|---------|
| `/pm prd <아이디어>` | 질문으로 요구사항을 모아 PRD(제품 요구사항 문서)를 작성 |
| `/pm roadmap` | PRD를 단계·작업·우선순위·의존성이 있는 로드맵으로 정리 |
| `/pm next` | 로드맵에서 다음 작업 하나를 골라 계획 → 구현 → 코드 리뷰 → 문서 체크 → 커밋 안내까지 진행 |
| `/pm status` | 진행 상황 요약 |
| `/test` | Playwright로 브라우저를 열어 사이트를 직접 확인 (데스크톱·모바일, 다크·라이트) |
| `/commit` | 개인정보·보안 검사를 통과한 뒤 기능 단위로 커밋 |
| `/commit-test` | 보안 검사 → 브라우저 테스트 → 커밋을 한 번에 (둘 다 통과해야 커밋) |

### 서브에이전트 (`.claude/agents/`)

| 에이전트 | 역할 |
|----------|------|
| `product-manager` | PRD·로드맵 문서 작성 전담 (훅으로 문서 폴더만 접근하도록 제한) |
| `code-reviewer` | 작업이 끝나면 변경사항의 버그·보안·Next.js 규칙 위반을 찾아 보고 (코드는 고치지 않음) |
| `privacy-guard` | 커밋 직전에 스테이징된 변경과 커밋 메시지에서 개인정보·비밀값을 검사 |

### 훅 (`.claude/hooks/`)과 안전장치

- **코드 리뷰 요청**: 작업을 마칠 때 리뷰하지 않은 변경이 있으면 `code-reviewer`를 실행하게 합니다.
- **커밋 전 검사**: `git commit` 직전에 작성자 정보(GitHub noreply 이메일)와 gitleaks를 검사하고, `--no-verify` 같은 우회를 막습니다.
- **푸시 금지**: Claude는 `git push`를 할 수 없고, 푸시는 사람이 GitHub Desktop에서 직접 합니다.
- **Discord 알림**: 기획·리뷰·테스트·커밋 결과를 Discord 웹후크로 알립니다 (웹후크 주소는 환경 변수로만 다룸).

### 한 작업의 흐름 (`/pm next`)

1. 로드맵에서 의존 작업이 끝난 다음 작업을 고릅니다.
2. 플랜 모드에서 코드를 살펴보고, 정할 것은 질문으로 결정한 뒤 계획을 승인받습니다 (`.claude/docs/plans/`에 저장).
3. 구현하고 `lint`·타입 검사·빌드를 통과시킵니다.
4. `code-reviewer`가 리뷰합니다.
5. `product-manager`가 로드맵에 완료와 결정 사항을 반영합니다.
6. `/commit` 또는 `/commit-test`로 검사 후 커밋합니다.

## 시작하기

```powershell
npm install
npm run dev          # 개발 서버 (http://localhost:3000)
npm run lint         # ESLint
npx tsc --noEmit     # 타입 검사
npm run build        # 정적 빌드 → out/
```

`main` 브랜치에 푸시하면 GitHub Actions가 gitleaks → `npm ci` → `npm audit` → 빌드 → Pages 배포를 실행합니다.

## 콘텐츠 추가

- **글**: `content/posts/<slug>.mdx` (frontmatter: title, date, summary, tags, thumbnail). 태그는 영문 slug로 쓰고, 한글 이름은 `content/tags.json`에 적습니다.
- **게임 기록**: `content/games/<연도>.json`, 표지는 `public/images/games/<연도>/`
- **소개**: `content/profile.json`, `skills.json`, `timeline.json`
- **배경 음악**: `content/music.json` + `public/audio/<파일>.mp3` (둘 다 있을 때만 버튼이 나타남)

파일을 추가하고 푸시하면 코드 수정 없이 사이트에 반영됩니다. 자세한 절차와 필드 예시는 [콘텐츠 작성 가이드](docs/writing-posts.md)를 보세요.

## 버전

현재 버전과 변경 내용은 [CHANGELOG.md](CHANGELOG.md)에 있습니다. 큰 기능은 1.X.0, 작은 기능은 1.0.X로 올립니다.
