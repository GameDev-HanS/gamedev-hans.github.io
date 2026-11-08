# PreToolUse hook for git commands run by Claude:
#   - git push (and push-like commands, aliases, Start-Process/iex wrappers) is always denied.
#   - Options that skip git hooks (--no-verify, setting core.hooksPath) are always denied.
#   - For git commit:
#       1. Only the staged changes may be committed: no staging, pathspecs, -i/-o in the same command.
#       2. The author cannot be changed in the command (--author, -c, git config, GIT_CONFIG_*, ...).
#       3. The author/committer must be the GitHub noreply identity (name = GitHub login).
#       4. gitleaks scans the staged changes; any secret found => denied (no override).
#       5. Otherwise the commit runs without asking, but only when it is a standalone git commit
#          command; anything chained to it (; | && newline redirect $( ) ...) makes the user confirm.
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

# Commit messages are data, not commands: drop them before checking, so a message like
# "docs: git push 규칙" does not trigger the rules below. Only text the shell will NOT run is dropped:
# single-quoted strings, and double-quoted ones without $ or backticks (those can run commands).
$scan = $cmd -replace '@''[\s\S]*?''@|@"(?:(?!"@)[^$`])*"@', ' MSG '
$msgValue = '(?:''[^'']*''|"[^"$`]*"|MSG|[^\s"''$`]+)'
$inCommit = '(?<=\bcommit\b[^;|\r\n]*\s)'   # only -m/--message that belongs to a git commit
$scan = $scan -replace ($inCommit + '--message(?:=|\s+)' + $msgValue), ' '
# Keep flags combined with -m (e.g. -nm, -am) so the checks below still see -n / -a.
$scan = [regex]::Replace($scan, $inCommit + '(-[A-Za-z]*?)m(?:=|\s*)' + $msgValue,
    [System.Text.RegularExpressions.MatchEvaluator] { param($m) if ($m.Groups[1].Value -eq '-') { ' ' } else { ' ' + $m.Groups[1].Value + ' ' } })

# A git call: `git`, `git.exe`, `git.cmd`, a quoted path ending in git.exe, a variable (`$g`, `"$g"`, `${g}`),
# or a parenthesised lookup such as `(Get-Command git)`,
# followed by any global options (-C <dir>, -c k=v, --no-pager, --git-dir=...) and then the subcommand.
$gitCall = '(?i)(?:\bgit(?:\.exe|\.cmd)?[''")]*|\$\{?\w+\}?[''"]?|\([^()]*\bgit\b[^()]*\)(?:\.\w+)*)'
$globalOpts = '(?<g>(?:\s+(?:-[Cc]\s+(?:''[^'']*''|"[^"]*"|\S+)|--[\w-]+(?:=(?:''[^'']*''|"[^"]*"|\S+))?|-[A-Za-z](?=\s)))*)'
function Get-GitSub([string]$sub) { return [regex]::Match($scan, $gitCall + $globalOpts + '\s+(?:' + $sub + ')(?![-\w])') }

$mentionsGit = $scan -match $gitCall

# --- always denied: push ---
if ((Get-GitSub 'push|send-pack|http-push').Success -or (Get-GitSub 'subtree\s+push').Success) {
    Decide 'deny' 'Claude는 푸시하지 않습니다. 푸시는 사용자가 GitHub Desktop에서 직접 합니다.'
}
# Wrappers that hide the git arguments from the checks above.
if ($scan -match '(?i)\b(Start-Process|saps|Invoke-Expression|iex)\b' -and $scan -match '(?i)\bgit' -and $scan -match '(?i)\b(push|commit)\b') {
    Decide 'deny' 'Start-Process/Invoke-Expression로 git push·commit을 실행할 수 없습니다. git을 직접 호출하세요.'
}
# Aliases can rename push/commit into something the checks do not recognise.
if ($mentionsGit -and $scan -match '(?i)\balias\.') {
    Decide 'deny' 'git 별칭(alias)을 만들거나 바꿀 수 없습니다. 별칭으로 push·commit 검사를 우회할 수 있기 때문입니다.'
}

# --- always denied: skipping git hooks ---
if ($mentionsGit -and $scan -match '(?i)--no-verify') {
    Decide 'deny' 'git 훅(비밀값 검사)을 건너뛰는 --no-verify는 사용할 수 없습니다.'
}
# Judge each statement on its own, so a read (`--get`) in one statement cannot excuse a write in another.
foreach ($stmt in ($scan -split '(?:;|\|\||&&|\||\r?\n)')) {
    if ($stmt -notmatch '(?i)core\.hooksPath') { continue }
    $isWrite = $stmt -match '(?i)core\.hooksPath\s*=' -or
        $stmt -match '(?i)--(unset|unset-all|replace-all|add|edit)\b' -or
        ($stmt -match '(?i)core\.hooksPath\s+\S' -and $stmt -notmatch '(?i)--(get|get-all|get-regexp|list|show-origin)\b')
    if ($isWrite) { Decide 'deny' 'core.hooksPath를 바꿔 git 훅(비밀값 검사)을 건너뛸 수 없습니다.' }
}

$git = $null
function Find-Git {
    $p = (Get-Command git -ErrorAction SilentlyContinue).Source
    if (-not $p) {
        $p = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
    }
    return $p
}

# Existing aliases that expand to push/commit/config are also blocked when called.
if ($mentionsGit) {
    $git = Find-Git
    if ($git) {
        $ErrorActionPreference = 'Continue'
        $aliases = & $git config --get-regexp '^alias\.' 2>$null
        $ErrorActionPreference = 'Stop'
        foreach ($line in @($aliases)) {
            if ($line -match '^alias\.(?<name>[\w-]+)\s+(?<val>.*)$' -and $Matches['val'] -match '(?i)push|commit|config|send-pack|!') {
                if ((Get-GitSub ([regex]::Escape($Matches['name']))).Success) {
                    Decide 'deny' "git 별칭 '$($Matches['name'])'은 push·commit·config를 실행하므로 쓸 수 없습니다."
                }
            }
        }
    }
}

$commit = Get-GitSub 'commit'
if (-not $commit.Success) { exit 0 }

# --- commit-only rules ---
# Staging inside the same command would commit files the privacy check never saw.
if ((Get-GitSub 'add|stage|rm|mv|restore|update-index').Success) {
    Decide 'deny' '같은 명령 안에서 스테이징을 바꾸면서 커밋할 수 없습니다. 스테이징 후 privacy-guard 검사를 받고 git commit을 단독으로 실행하세요.'
}
# Running the commit in another repository or with injected config skips the checks below.
if ($commit.Groups['g'].Value -match '(?i)(^|\s)(-C|-c|--git-dir|--work-tree|--config-env|--exec-path|--namespace)\b') {
    Decide 'deny' 'git commit에는 -C, -c, --git-dir, --work-tree 같은 전역 옵션을 쓸 수 없습니다. 저장소 루트에서 git commit만 실행하세요.'
}
if ((Get-GitSub 'config').Success -or $scan -match '(?i)--config-env|GIT_CONFIG_|GIT_(AUTHOR|COMMITTER)_(NAME|EMAIL)|--author\b|\buser\.(name|email)\b') {
    Decide 'deny' '커밋 작성자를 명령에서 바꿀 수 없습니다 (--author, git config, GIT_CONFIG_*, GIT_AUTHOR_* 금지). git config의 GitHub noreply 정보로만 커밋합니다.'
}

# Inspect the commit's own arguments (up to the end of that statement).
$rest = $scan.Substring($commit.Index + $commit.Length)
$rest = ($rest -split '(;|\|\||&&|\||\r?\n|\))')[0]
$rest = $rest -replace '''[^'']*''|"[^"]*"', 'Q'
# -m/--message stay here when their value was not dropped above (e.g. a double-quoted message with $).
$valueOpts = '^(-m|--message|-F|--file|-t|--template|-C|-c|--reuse-message|--reedit-message|--fixup|--squash|--date|--cleanup|--trailer)$'
$expectValue = $false
foreach ($tok in ($rest -split '\s+' | Where-Object { $_ })) {
    if ($expectValue) { $expectValue = $false; continue }
    if ($tok -eq '--' -or $tok -match '^(-i|--include|-o|--only|--pathspec-from-file.*|-[A-Za-z]*a[A-Za-z]*|--all)$') {
        Decide 'deny' '스테이징된 변경만 커밋할 수 있습니다. 파일 지정(-- 경로, -i, -o)이나 -a/--all 커밋은 검사하지 않은 내용이 들어갈 수 있어 막습니다.'
    }
    if ($tok -match '^-[A-Za-z]*n[A-Za-z]*$') {
        Decide 'deny' 'pre-commit 비밀값 검사를 건너뛰는 옵션(-n)은 사용할 수 없습니다.'
    }
    if ($tok -match $valueOpts) { $expectValue = $true; continue }
    if ($tok -notmatch '^-') {
        Decide 'deny' "스테이징된 변경만 커밋할 수 있습니다. git commit 뒤에 경로로 보이는 인자('$tok')가 있어 막습니다."
    }
}

if (-not $git) { $git = Find-Git }
if (-not $git) { Decide 'deny' 'git 실행 파일을 찾지 못해 비밀값 검사를 할 수 없습니다.' }

# Always check the repository root, even when the command runs from a subfolder such as .claude.
$cwd = if ($payload.cwd) { [string]$payload.cwd } else { (Get-Location).Path }
try {
    $ErrorActionPreference = 'Continue'
    $repo = ((& $git -C $cwd rev-parse --show-toplevel 2>$null) | Out-String).Trim()
    $ErrorActionPreference = 'Stop'
} catch { $repo = '' }
if (-not $repo) { Decide 'deny' "git 저장소 루트를 찾지 못해 검사를 할 수 없습니다 (작업 폴더: $cwd)." }

# --- author identity: must be "<login> <id+login@users.noreply.github.com>" ---
foreach ($kind in 'GIT_AUTHOR_IDENT', 'GIT_COMMITTER_IDENT') {
    try {
        $ErrorActionPreference = 'Continue'
        $ident = ((& $git -C $repo var $kind 2>$null) | Out-String).Trim()
        $ErrorActionPreference = 'Stop'
    } catch { $ident = '' }
    if ($ident -notmatch '^(?<name>.*?) <(?<email>[^>]*)>') {
        Decide 'deny' "커밋 작성자 정보($kind)를 읽지 못해 커밋을 막았습니다. git config user.name / user.email을 확인하세요."
    }
    $name = $Matches['name'].Trim(); $email = $Matches['email'].Trim()
    if ($email -notmatch '^\d+\+(?<login>[A-Za-z0-9-]+)@users\.noreply\.github\.com$') {
        Decide 'deny' '커밋 이메일이 GitHub noreply 주소가 아니어서 커밋을 막았습니다. git config user.email "<id>+<GitHub 사용자명>@users.noreply.github.com"으로 설정하세요.'
    }
    if ($name -ne $Matches['login']) {
        Decide 'deny' '커밋 작성자 이름이 GitHub 사용자명과 달라 커밋을 막았습니다 (실명 노출 방지). git config user.name을 GitHub 사용자명으로 설정하세요.'
    }
}

# --- gitleaks secret scan of staged changes ---
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

try {
    $ErrorActionPreference = 'Continue'
    $out = & $gl @glArgs 2>$null | Out-String
    $code = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
} catch { Decide 'deny' "gitleaks 실행 중 오류가 나서 커밋을 막았습니다: $($_.Exception.Message)" }
if ($code -eq 1) {
    $found = @()
    try { $found = @($out | ConvertFrom-Json | ForEach-Object { "$($_.File):$($_.StartLine) ($($_.RuleID))" }) } catch {}
    $list = if ($found.Count) { ($found | Select-Object -First 10) -join ', ' } else { '세부 정보 없음' }
    Decide 'deny' "gitleaks가 스테이징된 변경사항에서 비밀값을 찾아 커밋을 막았습니다: $list. 값을 제거하거나 해당 파일을 스테이징에서 빼고, 이미 노출된 키는 폐기 후 재발급하세요."
}
if ($code -ne 0) { Decide 'deny' "gitleaks 검사가 오류로 끝나(종료 코드 $code) 커밋을 막았습니다. 검사가 정상 동작해야 커밋할 수 있습니다." }

# 검사를 모두 통과하면 묻지 않고 커밋합니다 (원격 반영은 사용자가 푸시할 때 결정).
# 'allow'는 명령 전체를 권한 확인 없이 실행하므로, 금지 기호를 찾는 방식이 아니라
# 원본 명령 전체가 아래 형태와 처음부터 끝까지 정확히 일치할 때만 허용합니다 (허용 목록). 나머지는 모두 묻습니다.
#   [&] <git | git.exe | 'git 실제 경로' | "git 실제 경로"> commit <-m|--message> <메시지 하나>
#   메시지: '작은따옴표 한 줄' | @'(줄바꿈) 여러 줄 (줄바꿈)'@ here-string
# 메시지 안에서 금지하는 문자:
#   - ' ‘ ’ ‚ ‛ / " “ ” „ : PowerShell은 스마트 따옴표도 따옴표로 취급해 문자열을 끝낼 수 있음
#   - " \ : PowerShell 5.1이 git에 인자를 넘길 때 " 를 이스케이프하지 않아 -a, --no-verify 같은 인자가 끼어들 수 있음
#   - CR 단독, 제어 문자, 유니코드 줄바꿈: here-string을 일찍 끝내고 다음 줄을 명령으로 실행할 수 있음
# 토큰 사이는 공백·탭만 허용합니다 (\s는 줄바꿈까지 포함하므로 쓰지 않음).
$q = '''‘’‚‛'
$bad = $q + '"“”„\\\r\x00-\x08\x0B\x0C\x0E-\x1F\u0085  '
$nl = '(?:\r\n|\n)'
$exe = '(?:git(?:\.exe)?|''' + [regex]::Escape($git) + '''|"' + [regex]::Escape($git) + '")'
$msg = "(?:'(?:[^$bad\n]|'')*'|@'$nl(?:[^$bad\n]|$nl(?![$q]@))*$nl'@)"
$strict = '^[ \t\r\n]*(?:&[ \t]*)?' + $exe + '[ \t]+commit[ \t]+(?:-m|--message)[ \t]+' + $msg + '[ \t\r\n]*\z'
if ($cmd -match '\r(?!\n)' -or $cmd -cnotmatch $strict) {
    Decide 'ask' 'gitleaks 비밀값 검사와 작성자 확인 통과. 다만 정해진 단독 커밋 형태가 아니어서 자동 실행하지 않습니다. 실행할지 승인해 주세요.'
}
Decide 'allow' 'gitleaks 비밀값 검사와 작성자 확인 통과. 커밋합니다 (푸시는 사용자가 GitHub Desktop에서).'
