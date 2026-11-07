---
description: 개인정보·보안 검사 후 커밋하고 결과를 Discord로 알립니다 (푸시는 사용자가 GitHub Desktop에서)
argument-hint: "[선택: 커밋 메시지 힌트]"
---

변경사항을 개인정보·보안 검사한 뒤 커밋하고, 결과를 Discord로 알려 주세요.
**푸시는 하지 않습니다.** 사용자가 GitHub Desktop에서 직접 합니다.

추가 요청: $ARGUMENTS

## 준비

PATH에 git이 없을 수 있으니 조회용 명령에서는 아래로 `$g`를 정하고 `& $g ...`로 호출합니다.

```powershell
$g = (Get-Command git -ErrorAction SilentlyContinue).Source; if (-not $g) { $g = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName }
```

알림은 다음 명령으로 보냅니다. `-Detail`에는 비밀값이나 개인정보를 그대로 넣지 말고 가려서 적습니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type commit -Status <passed|blocked|failed> -Detail "<요약>"
```

## 절차

1. `& $g status --short`, `& $g diff HEAD --stat`, `& $g log --oneline -10`으로 변경 내용과 기존 메시지 스타일을 파악합니다. 변경사항이 없으면 알리고 끝냅니다(알림 없음).

2. 스테이징만 단독 명령으로 실행합니다: `& $g add -A`

3. 변경을 **주요 기능·수정 단위로 나눈 커밋 계획**을 세웁니다. 서로 관련된 파일끼리 묶고, 다른 커밋이 의존하는 변경(설정, `.gitignore` 등)을 먼저 둡니다. 변경이 하나의 단위면 커밋 하나로 충분합니다.
   커밋마다 메시지 초안을 씁니다. 기존 스타일을 따르고, 없으면 Conventional Commits(`feat:`, `fix:`, `chore:`, `docs:` 등) + 한국어. `$ARGUMENTS`의 힌트를 반영합니다.

4. **Agent 도구로 `privacy-guard` 서브에이전트를 실행**합니다 (포그라운드). 전체 변경을 스테이징한 상태로 한 번 검사하고, 프롬프트에 커밋 계획(커밋별 파일과 메시지 초안)을 넣습니다. 이 단계는 건너뛸 수 없습니다. 에이전트는 위험 요소를 보고만 하고 아무것도 바꾸지 않습니다.

5. 검사 결과를 사용자에게 짧게 보여 줍니다: 결과, gitleaks 결과, 위험 요소(값은 가려서), 참고 사항, 파일 수, 커밋 메시지.
   - **커밋 불가** (스테이징된 것 없음): 커밋하지 않고 끝냅니다.
   - **위험 있음**: AskUserQuestion으로 "위험 파일 제외 후 커밋 / 그대로 커밋 / 취소"를 묻습니다. 제외를 고르면 그 파일만 `& $g restore --staged -- "<경로>"`로 빼고 진행합니다. 취소면 `-Status blocked`로 알림을 보내고 끝냅니다.
   - **위험 없음**: 바로 다음 단계로 갑니다.
   - 에이전트가 메시지 수정을 제안했으면 그 메시지를 씁니다.

6. 커밋 계획대로 하나씩 커밋합니다. 커밋을 나눌 때는 먼저 `& $g reset -q`로 스테이징을 비우고, 커밋마다 `& $g add -- <파일들>`(단독 명령) → 커밋(단독 명령)을 반복합니다. 검사를 통과한 파일만 다시 스테이징합니다. 커밋 훅이 PowerShell 옵션(`-ErrorAction` 등)을 우회 옵션으로 오인하지 않도록 **git 경로를 먼저 따로 조회**하고, 커밋 명령에는 그 경로만 직접 적습니다:
   - 조회: `(Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName` (PATH에 git이 있으면 `git`을 그대로 씀)
   - 커밋 (단독 명령, 닫는 `'@`는 줄 맨 앞):
   ```
   & '<조회한 git.exe 경로>' commit -m @'
   제목

   본문
   '@
   ```
   - 훅이 gitleaks로 한 번 더 검사해 비밀값이 있으면 막습니다(이 경우 `-Status blocked`로 알리고 원인 보고). 없으면 사용자 승인 창이 뜹니다. 사용자가 거부하면 `-Status blocked -Detail "사용자가 커밋을 취소함"`으로 알리고 끝냅니다.
   - 실패하면 `-Status failed -Detail "<오류 요약>"`로 알리고 원인을 보고합니다. `--no-verify`로 우회하지 않습니다.

7. 모든 커밋이 끝나면 `-Status passed`로 알림을 한 번 보냅니다. `-Detail`에 커밋 개수와 각 제목을 적고, 제외한 파일이 있으면 `제외: <경로> (<이유>)`도 함께 적습니다. 중간에 실패하면 그 시점에 `-Status failed`로 알리고 남은 커밋은 멈춥니다.

8. 사용자에게 커밋별 해시와 메시지, 제외한 파일, 알림 전송 여부를 짧게 보고하고, 마지막 줄에 "GitHub Desktop에서 Push origin을 눌러 푸시하세요."라고 적습니다.
