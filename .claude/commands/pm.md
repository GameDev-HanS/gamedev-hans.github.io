---
description: 기획부터 개발까지 진행합니다 — PRD 작성 → 로드맵 → TODO를 하나씩 계획·구현·리뷰·커밋 (문서 작성은 product-manager 서브에이전트가 맡음)
argument-hint: "prd <아이디어> | roadmap | next | status"
---

사용자와 함께 기획하고 개발을 진행합니다. **메인 세션(당신)이 사용자와 대화·계획·구현을 맡고**, 문서(PRD, ROADMAP)는 `product-manager` 서브에이전트가 씁니다. 서브에이전트는 사용자에게 질문할 수 없으므로, 질문은 항상 여기서 AskUserQuestion으로 합니다.

요청: $ARGUMENTS

## 공통 규칙

- **이 명령으로 만드는 계획 문서는 모두 `.claude/docs/` 아래에 둡니다.**
  - `.claude/docs/PRD.md`, `.claude/docs/ROADMAP.md` (지침: `.claude/docs/prd-guide.md`)
  - TODO별 계획: `.claude/docs/plans/<작업 번호>.md` (예: `plans/T-101.md`)
- `product-manager`는 Agent 도구로 **포그라운드** 실행하고, 프롬프트 첫 줄에 `모드: PRD` 또는 `모드: ROADMAP`을 적습니다.
- 메인 세션은 PRD.md를 직접 고치지 않고 product-manager에게 맡깁니다. ROADMAP.md는 `/pm next`의 계획 링크 추가와 체크 표시(`[ ]` → `[x]`)만 직접 고칩니다. `plans/` 파일은 메인 세션이 씁니다.
- 알림 명령 (`-Detail`에는 비밀값·개인정보를 넣지 않음):
  ```powershell
  powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type pm -Status <passed|blocked|failed> -Step "<단계>" -Detail "<요약>"
  ```
  - `blocked`: 사용자가 중단·취소함, `failed`: 에이전트 오류 등으로 진행 불가
- 기존 흐름은 그대로 씁니다: 코드 리뷰는 Stop 훅 → `code-reviewer`, 커밋은 `/commit` 또는 `/commit-test`, 푸시는 사용자가 GitHub Desktop에서. Claude는 푸시하지 않습니다.

요청의 첫 단어로 아래 중 하나를 실행합니다. 비어 있거나 알 수 없으면 `status`를 실행하고 사용법을 한 줄로 안내합니다.

## `prd <아이디어>` — PRD 작성

1. 아이디어가 비어 있으면 무엇을 만들지 묻고 기다립니다.
2. `.claude/docs/PRD.md`가 이미 있으면 AskUserQuestion으로 "수정 / 새로 작성 / 취소"를 묻습니다.
3. AskUserQuestion으로 PRD에 필요한 빈 부분을 묻습니다 (한 번에 최대 4개, 아이디어에 이미 있는 내용은 묻지 않음).
   - 목적과 대상 사용자, 꼭 필요한 핵심 기능, 이번에 뺄 기능, 참고 사이트나 분위기
4. `product-manager`를 `모드: PRD`로 실행합니다. 프롬프트에 아이디어, 사용자 답변, (수정이면) 수정 요청을 넣습니다.
5. 보고를 사용자에게 짧게 보여 주고 AskUserQuestion으로 "확정 / 수정 요청"을 묻습니다. 수정이면 4단계를 다시 실행합니다.
6. 확정하면 `-Status passed -Step "PRD 작성"`으로 알리고, 다음 단계로 `/pm roadmap`을 안내합니다.

## `roadmap` — 로드맵 작성·갱신

1. `.claude/docs/PRD.md`가 없으면 `/pm prd <아이디어>`를 먼저 하라고 안내하고 끝냅니다.
2. `product-manager`를 `모드: ROADMAP`으로 실행합니다. 갱신이면 "기존 완료 표시, 메모, `계획:` 링크 유지"를 프롬프트에 적습니다.
3. 보고(단계·작업 수, 다음 작업, 기술 검토 필요, 미결 사항)를 보여 줍니다. 미결 사항이 있으면 AskUserQuestion으로 결정을 받고, 결정이 문서에 반영되도록 2단계를 한 번 더 실행합니다.
4. `-Status passed -Step "로드맵 생성"`으로 알리고, `/pm next`를 안내합니다.

## `next` — TODO 하나 진행

1. **작업 고르기:** ROADMAP.md에서 체크되지 않은 작업 중 의존 작업이 모두 끝난 것을 P0 → P1 → P2, 번호 순으로 하나 고릅니다. 남은 작업이 없으면 "모든 작업 완료"를 알리고 끝냅니다.
   - **크기 확인 (플랜 모드 전에):** 플랜 모드에서는 파일을 고칠 수 없으므로, 쪼개기는 플랜 모드 밖에서 합니다. 작업이 크면(파일 여러 곳, 하루 넘는 분량) AskUserQuestion으로 쪼갤지 묻습니다. 동의하면 `product-manager`를 `모드: ROADMAP`, "T-xxx를 하위 작업으로 쪼개기, 기존 완료 표시·메모 유지, T-xxx의 `계획:` 링크는 지우지 말고 첫 하위 작업 아래로 옮기기"로 실행하고, 첫 하위 작업을 고릅니다.
   - 이미 `계획:` 링크가 있는 작업을 쪼개면, product-manager가 그 링크를 첫 하위 작업 아래로 옮기고 계획 파일은 그대로 둡니다. 하위 작업의 계획은 2단계에서 `plans/T-103a.md`처럼 새 파일로 저장합니다.
2. **함께 계획 (플랜 모드):** EnterPlanMode로 들어가 작업의 완료 조건과 위치를 기준으로 코드를 살펴보고, 무엇을 어떻게 만들지 AskUserQuestion으로 정합니다. Next.js 16 API는 `node_modules/next/dist/docs/`를 먼저 확인합니다.
   - 플랜 모드 안에서 작업이 크다는 게 드러나면, ExitPlanMode로 "작업 쪼개기"를 계획으로 올려 승인받고 나온 뒤 1단계의 쪼개기를 실행합니다. 그다음 첫 하위 작업으로 다시 플랜 모드에 들어갑니다.
   - ExitPlanMode로 승인을 받습니다. 거부하면 `-Status blocked -Step "TODO <번호>"`로 알리고 멈춥니다.
   - **계획 저장:** 승인되면 구현 전에, 승인된 계획 내용을 `.claude/docs/plans/<번호>.md`로 저장합니다. 맨 위에 `# <번호> <작업 이름>`과 `> 승인일: <YYYY-MM-DD> · 로드맵: [ROADMAP](../ROADMAP.md)`를 적습니다. ROADMAP.md의 해당 작업 아래에 `  - 계획: [plans/<번호>.md](plans/<번호>.md)` 한 줄을 추가합니다. **같은 파일을 가리키는 링크가 이미 있으면 추가하지 않습니다.** 다른 계획 링크(예: 쪼개기 전 작업에서 옮겨 온 `plans/T-103.md`)가 있으면 지우지 말고 그 아래에 한 줄 더 추가합니다. 같은 번호의 파일이 이미 있으면 덮어쓰지 말고 `## 수정 (<날짜>)` 섹션으로 덧붙입니다.
3. **구현:** 승인된 계획대로 구현하고 `npm run lint`, `npx tsc --noEmit`을 통과시킵니다.
4. **리뷰:** 마무리할 때 Stop 훅이 `code-reviewer` 리뷰와 `-Type review` 알림을 요청하면 그대로 따릅니다. 문제가 있으면 고칠지 사용자에게 묻고, 고치기로 하면 고친 뒤 다시 리뷰를 받습니다. **리뷰 보고와 알림을 마친 뒤 멈추지 말고, 같은 턴에서 5단계로 이어 갑니다.** (고칠지 묻는 중이면 답을 받은 뒤 이어 갑니다.)
5. **체크:** 리뷰가 정리되면 ROADMAP.md에서 그 작업을 `[x]`로 바꿉니다 (코드와 함께 커밋되도록 커밋 전에).
6. **알림:** `-Status passed -Step "TODO 완료 (<번호>)"`, `-Detail`에 작업 이름과 바뀐 파일 수를 적어 알립니다.
7. **커밋 안내:** 사이트 화면이 바뀌었으면 `/commit-test`, 아니면 `/commit`을 안내합니다. 사용자가 원하면 그 명령의 절차를 그대로 실행합니다 (privacy-guard 검사 생략 불가, 커밋 승인은 사용자). 끝나면 "GitHub Desktop에서 Push origin을 눌러 푸시하세요."와 다음 작업 번호를 알려 줍니다.

## `status` — 진행 상황 (알림 없음)

ROADMAP.md를 읽어 다음을 짧게 보여 줍니다. 파일이 없으면 시작 방법(`/pm prd <아이디어>`)을 안내합니다.

```
진행: 완료 <n> / 전체 <n> (단계 1 <n>/<n>, 단계 2 <n>/<n> …)
다음 작업: <번호> <이름> · <우선순위> · <규모>
미결 사항: <개수>건
```
