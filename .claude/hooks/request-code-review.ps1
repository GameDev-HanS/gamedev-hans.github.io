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
$changes = & $git -C $repo status --porcelain 2>$null
if (-not $changes) { exit 0 }

# Fingerprint = tracked diff + contents of new (untracked, not ignored) files.
$sb = New-Object System.Text.StringBuilder
[void]$sb.Append((& $git -C $repo diff HEAD --no-color 2>$null | Out-String))
foreach ($f in (& $git -C $repo ls-files --others --exclude-standard 2>$null)) {
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

$count = @($changes).Count
@{
    decision = 'block'
    reason   = "리뷰하지 않은 코드 변경이 있습니다 (파일 $($count)개). 마무리하기 전에 Agent 도구로 code-reviewer 서브에이전트를 포그라운드로 실행해 변경사항을 리뷰하세요. 결과를 사용자에게 짧게 보고하고 (문제가 있으면 고칠지 물어봄), 이어서 'powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 -Type review -Status <passed|blocked|failed> -Detail <요약>'으로 Discord에 알리세요. passed=문제 없음, blocked=수정 필요, failed=검사 실패. 리뷰만 하고 코드는 사용자가 요청할 때만 고칩니다."
} | ConvertTo-Json -Compress
exit 0
