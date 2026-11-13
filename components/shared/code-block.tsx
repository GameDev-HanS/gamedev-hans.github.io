import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// 코드 블록 상단 바에 보일 언어 표시 이름. 글에 적은 이름(별칭 포함)을 소문자로 찾고, 없으면 적은 이름 그대로 씁니다.
const LANGUAGE_LABELS: Record<string, string> = {
  csharp: "C#",
  cs: "C#",
  "c#": "C#",
  cpp: "C++",
  "c++": "C++",
  hlsl: "HLSL",
  glsl: "GLSL",
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  shell: "Shell",
  sh: "Shell",
  bash: "Shell",
}

export function getLanguageLabel(language: string): string {
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language
}

type CodeBlockProps = ComponentProps<"pre"> & { language?: string }

// 글 본문의 코드 블록 패널 (T-301). 하이라이트 색은 빌드 때 rehype-pretty-code가 넣고(next.config.ts),
// 여기서는 본문과 구분되는 배경·테두리와 언어 이름 상단 바만 그립니다. 클라이언트 JS는 없습니다.
// not-prose: 글 상세의 prose 기본 pre 스타일(진한 배경 등)이 덮어쓰지 않게 함
export function CodeBlock({ language, className, children, ...props }: CodeBlockProps) {
  return (
    <div className="not-prose my-6 min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground">
      {language && (
        <div className="border-b bg-muted px-4 py-1.5 font-mono text-xs text-muted-foreground">
          {getLanguageLabel(language)}
        </div>
      )}
      {/* 긴 줄은 패널 안에서만 가로 스크롤 (페이지 폭을 넘지 않음).
          tabIndex: 마우스 없이도 Tab으로 포커스해 방향키로 스크롤할 수 있게 함. 패널이 overflow-hidden이라 포커스 링은 안쪽(inset)에 그림 */}
      <pre
        tabIndex={0}
        {...props}
        className={cn(
          "overflow-x-auto p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
          className
        )}
      >
        {children}
      </pre>
    </div>
  )
}
