# product-manager 서브에이전트 전용 PreToolUse 훅 (에이전트 frontmatter의 hooks에서만 호출)
# 소스 파일에는 접근하지 못하고 문서만 다루게 막습니다.
#   - Read          : 저장소 안의 문서 파일(.md, .mdx, .txt)만
#   - Grep          : 문서 파일 하나, 또는 문서 폴더(.claude/docs/, docs/, node_modules/next/dist/docs/) 안에서만
#   - Glob          : 파일 이름만 보여 주므로 허용
#   - Write / Edit  : .claude/docs/PRD.md, .claude/docs/ROADMAP.md만 (지침 문서 prd-guide.md는 수정 불가)
#   - 그 밖의 도구  : 모두 차단
# 오류가 나면 허용하지 않고 차단합니다.
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

try {
    $reader = New-Object System.IO.StreamReader([Console]::OpenStandardInput(), [System.Text.Encoding]::UTF8)
    $payload = $reader.ReadToEnd() | ConvertFrom-Json
    $tool = [string]$payload.tool_name
    $root = [IO.Path]::GetFullPath($(if ($payload.cwd) { [string]$payload.cwd } else { (Get-Location).Path })).TrimEnd('\')

    # 저장소 기준 상대 경로(구분자 '/')를 돌려줍니다. 저장소 밖이면 $null.
    function Get-RelPath([string]$p) {
        if (-not $p) { return $null }
        if (-not [IO.Path]::IsPathRooted($p)) { $p = Join-Path $root $p }
        $full = [IO.Path]::GetFullPath($p).TrimEnd('\')
        if ($full -ieq $root) { return '' }
        if (-not $full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) { return $null }
        return $full.Substring($root.Length + 1).Replace('\', '/')
    }
    $isDoc = '(?i)\.(md|mdx|txt)$'
    $docDirs = '(?i)^(\.claude/docs|docs|node_modules/next/dist/docs)(/|$)'

    switch ($tool) {
        'Glob' { exit 0 }
        'Read' {
            $rel = Get-RelPath ([string]$payload.tool_input.file_path)
            if ($null -eq $rel) { Decide 'deny' 'product-manager는 저장소 밖의 파일을 읽을 수 없습니다.' }
            if ($rel -notmatch $isDoc) { Decide 'deny' "product-manager는 문서(.md, .mdx, .txt)만 읽을 수 있습니다. 소스 파일 접근 차단: $rel" }
            exit 0
        }
        'Grep' {
            $rel = Get-RelPath ([string]$payload.tool_input.path)
            if ($null -eq $rel -or $rel -eq '') { Decide 'deny' 'product-manager의 Grep은 문서 파일이나 docs/ 폴더를 path로 지정해야 합니다.' }
            if ($rel -notmatch $isDoc -and $rel -notmatch $docDirs) { Decide 'deny' "product-manager는 문서만 검색할 수 있습니다. 차단된 경로: $rel" }
            exit 0
        }
        { $_ -in 'Write', 'Edit' } {
            $rel = Get-RelPath ([string]$payload.tool_input.file_path)
            if ($null -ne $rel -and ($rel -ieq '.claude/docs/PRD.md' -or $rel -ieq '.claude/docs/ROADMAP.md')) { exit 0 }
            Decide 'deny' "product-manager는 .claude/docs/PRD.md와 .claude/docs/ROADMAP.md만 쓸 수 있습니다. 차단된 경로: $rel"
        }
        default { Decide 'deny' "product-manager는 '$tool' 도구를 쓸 수 없습니다 (문서 작업 전용)." }
    }
} catch {
    Decide 'deny' "product-manager 접근 검사 중 오류가 나서 차단했습니다: $($_.Exception.Message)"
}
