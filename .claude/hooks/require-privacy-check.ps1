# PreToolUse hook for `git commit`:
#   1. gitleaks scans the staged changes; any secret found => commit denied (no override).
#   2. Otherwise the user is asked to confirm the commit.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Decide([string]$decision, [string]$reason) {
    @{ hookSpecificOutput = @{
        hookEventName            = 'PreToolUse'
        permissionDecision       = $decision
        permissionDecisionReason = $reason
    } } | ConvertTo-Json -Depth 5 -Compress
    exit 0
}

# Read stdin as UTF-8; the default console code page breaks Korean text in the JSON.
$reader = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), [System.Text.Encoding]::UTF8)
$payload = $reader.ReadToEnd() | ConvertFrom-Json
$cmd = [string]$payload.tool_input.command
if (-not $cmd) { exit 0 }

# Only care about commands that run `git ... commit` (not commit-tree etc.).
# Matches `git commit`, `git.exe" commit`, `& $g commit`, `git -C dir commit`.
$isCommit = $cmd -match '(?i)(git(\.exe)?[''"]?|\$\w+)(\s+-C\s+\S+)?\s+commit(?![-\w])'
if (-not $isCommit) { exit 0 }

# Staging inside the same command would commit files the check never saw.
if ($cmd -match '(?i)(^|[\s;&|])add\s' -or $cmd -match '(?i)\scommit\b.*\s(-(?!-)[A-Za-z]*a[A-Za-z]*|--all)(\s|$)') {
    Decide 'deny' '같은 명령 안에서 스테이징(git add, commit -a)과 커밋을 함께 할 수 없습니다. 스테이징 후 privacy-guard 검사를 받고 git commit을 단독으로 실행하세요.'
}

# Skipping git's pre-commit hook would bypass the secret scan.
if ($cmd -match '(?i)(--no-verify|\s-[A-Za-z]*n[A-Za-z]*(\s|$))' -or $cmd -match '(?i)core\.hooksPath') {
    Decide 'deny' 'pre-commit 비밀값 검사를 건너뛰는 옵션(--no-verify, -n, core.hooksPath)은 사용할 수 없습니다.'
}

# --- gitleaks secret scan of staged changes ---
$repo = if ($payload.cwd) { [string]$payload.cwd } else { (Get-Location).Path }

$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) {
    $git = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}
if (-not $git) { Decide 'deny' 'git 실행 파일을 찾지 못해 비밀값 검사를 할 수 없습니다.' }
$env:Path = (Split-Path $git) + ';' + $env:Path   # gitleaks calls git from PATH

$gl = (Get-Command gitleaks -ErrorAction SilentlyContinue).Source
if (-not $gl) {
    $gl = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gitleaks.Gitleaks_*\gitleaks.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1).FullName
}
if (-not $gl) { Decide 'deny' 'gitleaks가 설치되어 있지 않아 비밀값 검사를 할 수 없습니다. winget install Gitleaks.Gitleaks 로 설치하세요.' }

$glArgs = @('git', $repo, '--staged', '--redact', '--no-banner', '--log-level', 'error', '--report-path', '-', '--report-format', 'json')
$cfg = Join-Path $repo '.gitleaks.toml'
if (Test-Path $cfg) { $glArgs += @('--config', $cfg) }

$out = & $gl @glArgs 2>$null | Out-String
$code = $LASTEXITCODE
if ($code -eq 1) {
    $found = @()
    try { $found = @($out | ConvertFrom-Json | ForEach-Object { "$($_.File):$($_.StartLine) ($($_.RuleID))" }) } catch {}
    $list = if ($found.Count) { ($found | Select-Object -First 10) -join ', ' } else { '세부 정보 없음' }
    Decide 'deny' "gitleaks가 스테이징된 변경사항에서 비밀값을 찾아 커밋을 막았습니다: $list. 값을 제거하거나 해당 파일을 스테이징에서 빼고, 이미 노출된 키는 폐기 후 재발급하세요."
}
if ($code -ne 0) { Decide 'deny' "gitleaks 검사가 오류로 끝나(종료 코드 $code) 커밋을 막았습니다. 검사가 정상 동작해야 커밋할 수 있습니다." }

Decide 'ask' 'gitleaks 비밀값 검사 통과. 개인정보 검사 결과를 확인한 뒤 이 커밋을 실행할지 승인해 주세요.'
