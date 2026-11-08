# Stop hook: when Claude is about to finish and there are uncommitted code changes
# that have not been reviewed yet, ask Claude to run the code-reviewer agent first.
# Each change state is reviewed once (fingerprint stored in .git/claude-code-review-state).
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$reader = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), [System.Text.Encoding]::UTF8)
$payload = $reader.ReadToEnd() | ConvertFrom-Json

# Already continuing because of this hook: never block twice in a row.
if ($payload.stop_hook_active) { exit 0 }

$repo = if ($payload.cwd) { [string]$payload.cwd } else { (Get-Location).Path }
$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) {
    $git = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}
if (-not $git) { exit 0 }

# git prints errors to stderr (e.g. no HEAD in a brand-new repo); don't let that abort the hook.
$ErrorActionPreference = 'Continue'

# 작업 폴더가 저장소의 하위 폴더여도 항상 저장소 루트 기준으로 봅니다.
# (아래 status·diff·ls-files의 경로와 계획 문서 판정이 모두 같은 기준을 쓰게 하기 위함)
$root = (& $git -C $repo rev-parse --show-toplevel 2>$null | Out-String).Trim()
if (-not $root) { exit 0 }
$repo = $root

# core.quotepath=off: 한글 등 파일 이름을 따옴표·8진수로 바꾸지 않고 그대로 출력
# -uall: 새 폴더도 파일 단위로 나열 (폴더 이름 한 줄로 뭉쳐 판정이 흐려지지 않게)
$changes = & $git -C $repo -c core.quotepath=off status --porcelain -uall 2>$null
if (-not $changes) { exit 0 }

# /pm 계획 문서(PRD, ROADMAP, plans/*.md)는 코드가 아니므로 리뷰 대상에서 뺍니다.
# 지침(prd-guide.md)이나 다른 확장자는 .claude/docs/ 안에 있어도 리뷰합니다.
# 대소문자를 구분합니다(-cnotmatch). git pathspec 제외도 대소문자를 구분하므로 기준을 맞춥니다.
$planDoc = '^\.claude/docs/(PRD\.md|ROADMAP\.md|plans/[^/]+\.md)$'
# 이름 변경(R  원래 -> 새)은 두 경로가 모두 계획 문서일 때만 뺍니다 (코드를 docs로 옮기는 것도 리뷰).
$codeChanges = @($changes | Where-Object {
    $parts = @($_.Substring(3) -split ' -> ' | ForEach-Object { $_.Trim('"') })
    @($parts | Where-Object { $_ -cnotmatch $planDoc }).Count -gt 0
})
if ($codeChanges.Count -eq 0) { exit 0 }

# Fingerprint = tracked diff + contents of new (untracked, not ignored) files, 계획 문서 제외.
# 리뷰 뒤 ROADMAP 체크나 계획 저장만 했을 때 같은 코드를 다시 리뷰하라고 요청하지 않기 위함입니다.
# ':/'와 top 매직: 어느 폴더에서 실행해도 저장소 전체를 대상으로, 제외 경로도 루트 기준으로 해석합니다.
$excludePlan = @(':(top,exclude).claude/docs/PRD.md', ':(top,exclude).claude/docs/ROADMAP.md', ':(top,exclude,glob).claude/docs/plans/*.md')
$sb = New-Object System.Text.StringBuilder
[void]$sb.Append((& $git -C $repo diff HEAD --no-color -- ':/' @excludePlan 2>$null | Out-String))
foreach ($f in (& $git -C $repo -c core.quotepath=off ls-files --others --exclude-standard 2>$null | Where-Object { $_ -cnotmatch $planDoc })) {
    $p = Join-Path $repo $f
    if (Test-Path $p -PathType Leaf) { [void]$sb.Append("$f`n" + (Get-FileHash $p -Algorithm SHA256).Hash + "`n") }
}
$sha = [System.Security.Cryptography.SHA256]::Create()
$fp = [BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($sb.ToString()))) -replace '-', ''

$gitDir = (& $git -C $repo rev-parse --absolute-git-dir 2>$null | Out-String).Trim()
if (-not $gitDir) { exit 0 }
$state = Join-Path $gitDir 'claude-code-review-state'
$last = if (Test-Path $state) { (Get-Content $state -Raw).Trim() } else { '' }
if ($last -eq $fp) { exit 0 }

Set-Content -Path $state -Value $fp -Encoding ascii

$count = $codeChanges.Count
@{
    decision = 'block'
    reason   = "리뷰하지 않은 코드 변경이 있습니다 (파일 $($count)개). 마무리하기 전에 Agent 도구로 code-reviewer 서브에이전트를 포그라운드로 실행해 변경사항을 리뷰하세요. 결과를 사용자에게 짧게 보고하고 (문제가 있으면 고칠지 물어봄), 이어서 'powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type review -Status <passed|blocked|failed> -Detail <요약>'으로 Discord에 알리세요. passed=문제 없음, blocked=수정 필요, failed=검사 실패. 리뷰만 하고 코드는 사용자가 요청할 때만 고칩니다."
} | ConvertTo-Json -Compress
exit 0
