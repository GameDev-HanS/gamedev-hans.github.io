---
description: Playwright MCP로 브라우저를 열어 사이트를 직접 테스트하고 결과를 보고합니다
argument-hint: "[선택: 테스트할 페이지나 기능, 예: /about 폼 제출]"
---

Playwright MCP(`mcp__playwright__*` 도구)로 사이트를 브라우저에서 직접 테스트하고 결과를 보고해 주세요.
**테스트만 합니다.** 문제를 찾아도 코드는 사용자가 요청할 때만 고칩니다.

추가 요청: $ARGUMENTS

## 범위

- `$ARGUMENTS`가 있으면 그 페이지·기능만 집중해서 테스트합니다.
- 없으면 아래 "기본 테스트"를 모두 실행합니다.

## 1. 개발 서버 준비

1. 이미 떠 있는지 확인합니다: `try { (Invoke-WebRequest http://localhost:3000 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { 'down' }`
2. 꺼져 있으면 PowerShell 도구의 `run_in_background`로 `npm run dev`를 실행하고, 위 명령으로 응답이 올 때까지 확인합니다. 출력에 다른 포트가 나오면 그 포트를 씁니다.
3. 직접 띄운 서버인지 기억해 둡니다 (마지막에 정리할 때 씀).

## 2. 기본 테스트

아래 항목을 되도록 `browser_run_code_unsafe` 한 번(많아야 두세 번)에 묶어 확인하고, 콘솔 오류는 그 안에서 `page.on('console')`로 모으거나 `browser_console_messages`(`level: "error"`)로 확인합니다. 화면 구조를 직접 봐야 할 때만 `browser_snapshot`을 씁니다.

| 대상 | 확인할 것 |
|------|-----------|
| `/` | 페이지가 뜨는지, 헤더·내비게이션·푸터가 보이는지 |
| `/about` | 페이지가 뜨는지, 내용이 비어 있지 않은지 |
| `/없는-페이지` | 404(not-found) 페이지가 뜨는지 |
| `/robots.txt`, `/sitemap.xml` | 내용이 정상으로 나오는지 |

**내비게이션**: 헤더의 링크를 `browser_click`으로 눌러 올바른 페이지로 가는지 확인합니다.

**테마 전환**: 테마 토글 버튼을 눌러 다크/라이트가 바뀌는지 확인합니다 (`html` 요소의 class 변화를 `browser_evaluate`로 확인).

**폼** (있는 경우)
- 빈 값으로 제출 → 오류 메시지와 `aria-invalid`가 표시되는지
- 올바른 값으로 제출 → 성공 알림(toast)이 뜨는지
- 테스트 입력에는 실제 개인정보 대신 `test@example.com` 같은 가짜 값만 씁니다.

**반응형**: `browser_resize`로 375×812(모바일)로 바꿔 `/`를 다시 확인합니다. 가로 스크롤이 생기지 않는지, 모바일 메뉴가 열리고 닫히는지 봅니다. 끝나면 1280×800으로 되돌립니다.

**스크린샷**: 문제가 보이는 화면만 `browser_take_screenshot`으로 찍습니다. 파일 이름은 주지 않습니다(주면 저장소 기준 경로로 저장됨). 그러면 `.mcp.json`의 `--output-dir`(`%TEMP%\playwright-mcp`)에 저장되어 저장소 밖에 남습니다. 전체 페이지(`fullPage`)는 찍지 않습니다.

**사용량 절약**
- 페이지마다 `browser_snapshot`을 받지 말고, `browser_run_code_unsafe` 한 번으로 여러 항목을 확인해 결과를 짧은 객체로만 돌려받습니다 (예: 제목·개수·URL·true/false). 페이지 전체 텍스트나 HTML은 돌려받지 않습니다.
- 콘솔은 `level: "error"`로만 확인합니다.
- 같은 항목을 두 번 확인하지 않습니다. 실패한 항목만 다시 봅니다.

## 3. 정리

1. `browser_close`로 브라우저를 닫습니다.
2. 1단계에서 직접 띄운 개발 서버만 종료합니다. 백그라운드로 실행한 그 작업만 멈추고(TaskStop), `Stop-Process -Name node`처럼 이름으로 node 프로세스를 한꺼번에 종료하지 않습니다. 사용자가 원래 띄워 둔 서버는 그대로 둡니다.

## 4. 보고 형식

```
결과: 통과 | 문제 있음 | 테스트 실패
테스트한 항목: <개수>개 (통과 <n> / 실패 <n>)
문제:
- [심각|보통|사소] <페이지 또는 기능> — <무엇이 잘못됐는지> (재현: <순서>)
콘솔 오류: <없음 또는 요약>
스크린샷: <저장 위치, 없으면 생략>
```

- "심각"은 페이지가 안 뜨거나 기능이 동작하지 않는 경우, "보통"은 화면 깨짐·접근성 문제, "사소"는 개선 제안입니다.
- 문제가 있으면 마지막에 고칠지 사용자에게 묻습니다.

## 5. Discord 알림

보고를 마치기 전에 결과를 Discord로 한 번 알립니다 (저장소 루트에서 실행):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type test -Status <passed|blocked|failed> -Detail "<요약>"
```

- 결과에 따라 `-Status`를 고릅니다: 통과 → `passed`, 문제 있음 → `blocked`, 테스트 실패(서버가 안 뜨는 등) → `failed`
- `-Detail`에는 테스트 범위, 통과/실패 개수, 문제 한 줄 요약을 적습니다. 폼 입력값 같은 개인정보나 비밀값은 넣지 않습니다.
- 보고 끝에 알림을 보냈는지 적습니다.
