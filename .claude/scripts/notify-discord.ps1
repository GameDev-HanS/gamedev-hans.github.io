# Sends a result to Discord via webhook.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .claude/scripts/notify-discord.ps1 [-Type commit|privacy|review] -Status passed|blocked|failed [-Detail "..."]
#   commit  : 커밋 결과 (Claude가 커밋한 경우)
#   privacy : /commit 개인정보 검사 결과 (커밋은 사용자가 GitHub Desktop에서)
#   review  : 코드 리뷰 결과
# The webhook URL is read from the DISCORD_WEBHOOK_URL environment variable (never stored in the repo).
param(
    [ValidateSet('commit', 'privacy', 'review')][string]$Type = 'commit',
    [ValidateSet('passed', 'blocked', 'failed')][string]$Status = 'passed',
    [string]$Detail = ''
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8  # read git's UTF-8 output correctly

$url = $env:DISCORD_WEBHOOK_URL
if (-not $url) { $url = [Environment]::GetEnvironmentVariable('DISCORD_WEBHOOK_URL', 'User') }
if (-not $url) { Write-Output 'DISCORD_WEBHOOK_URL이 설정되지 않아 알림을 건너뜁니다.'; exit 0 }
if ($url -notmatch '^https://(discord|discordapp)\.com/api/webhooks/') {
    Write-Output 'DISCORD_WEBHOOK_URL 형식이 Discord 웹훅 주소가 아니어서 알림을 건너뜁니다.'; exit 0
}

$g = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $g) {
    $g = (Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
}

$repo = Split-Path -Leaf ((& $g rev-parse --show-toplevel) | Out-String).Trim()
$branch = ((& $g rev-parse --abbrev-ref HEAD 2>$null) | Out-String).Trim()

$fields = @(
    @{ name = '저장소'; value = $repo; inline = $true },
    @{ name = '브랜치'; value = $branch; inline = $true }
)

$green = 3066993; $red = 15158332; $orange = 15105570; $blue = 3447003

switch ($Type) {
    'commit' {
        switch ($Status) {
            'passed' {
                $title = '✅ 커밋 완료 · 개인정보 검사 통과'; $color = $green
                $hash = ((& $g log -1 --format=%h) | Out-String).Trim()
                $subject = ((& $g log -1 --format=%s) | Out-String).Trim()
                $count = @(& $g show --name-only --format= HEAD | Where-Object { $_ }).Count
                $fields += @{ name = '커밋'; value = "``$hash`` $subject"; inline = $false }
                $fields += @{ name = '파일 수'; value = "$count"; inline = $true }
            }
            'blocked' { $title = '⛔ 커밋 중단 · 개인정보 검사에서 차단'; $color = $red }
            'failed' { $title = '⚠️ 커밋 실패'; $color = $orange }
        }
    }
    'privacy' {
        switch ($Status) {
            'passed' { $title = '🛡️ 개인정보 검사 통과 · GitHub Desktop에서 커밋하세요'; $color = $green }
            'blocked' { $title = '⛔ 개인정보 검사 · 위험 요소 발견'; $color = $red }
            'failed' { $title = '⚠️ 개인정보 검사 실패'; $color = $orange }
        }
        $count = @(& $g status --porcelain | Where-Object { $_ }).Count
        $fields += @{ name = '변경 파일 수'; value = "$count"; inline = $true }
    }
    'review' {
        switch ($Status) {
            'passed' { $title = '🔍 코드 리뷰 · 문제 없음'; $color = $blue }
            'blocked' { $title = '📝 코드 리뷰 · 수정 필요'; $color = $orange }
            'failed' { $title = '⚠️ 코드 리뷰 실패'; $color = $red }
        }
        $count = @(& $g status --porcelain | Where-Object { $_ }).Count
        $fields += @{ name = '변경 파일 수'; value = "$count"; inline = $true }
    }
}

if ($Detail) {
    if ($Detail.Length -gt 1000) { $Detail = $Detail.Substring(0, 1000) + '…' }
    $fields += @{ name = '상세'; value = $Detail; inline = $false }
}

$body = @{
    username = 'Claude Code'
    embeds   = @(@{ title = $title; color = $color; fields = $fields; timestamp = (Get-Date).ToUniversalTime().ToString('o') })
} | ConvertTo-Json -Depth 6

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json; charset=utf-8' `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) | Out-Null
    Write-Output 'Discord 알림을 보냈습니다.'
} catch {
    Write-Output "Discord 알림 전송 실패: $($_.Exception.Message)"
}
exit 0
