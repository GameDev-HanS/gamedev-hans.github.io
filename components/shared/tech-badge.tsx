import { Badge } from "@/components/ui/badge"
import { getTechIcon, type TechIconTone } from "@/lib/tech-icon"
import { cn } from "@/lib/utils"

// 너무 어둡거나 밝은 브랜드 색은 배경에 묻히므로 그 모드에서만 글자색으로 바꿉니다
const TONE_CLASS: Record<TechIconTone, string> = {
  normal: "text-(--brand)",
  dark: "text-(--brand) dark:text-foreground",
  light: "text-foreground dark:text-(--brand)",
}

// 기술 배지: 어두운 테마 배지 + 브랜드 색 아이콘 + 이름 (T-204).
// 아이콘이 없는 기술(C#·Windows 등)은 같은 크기 칸에 이름 첫 글자를 보여 줍니다.
// 이름 글자가 함께 있으므로 아이콘은 스크린 리더에서 숨깁니다 (plans/T-202.md).
export function TechBadge({ name, icon }: { name: string; icon?: string }) {
  const data = getTechIcon(icon)

  return (
    <Badge variant="outline" className="h-7 gap-1.5 bg-card px-2.5 font-mono text-xs tracking-wide">
      {data ? (
        <span
          aria-hidden
          className={cn("size-3.5 shrink-0", TONE_CLASS[data.tone])}
          style={{ "--brand": `#${data.hex}` } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
            <path d={data.path} />
          </svg>
        </span>
      ) : (
        <span
          aria-hidden
          className="flex size-3.5 shrink-0 items-center justify-center bg-muted text-[9px] leading-none font-bold text-muted-foreground"
        >
          {Array.from(name)[0]}
        </span>
      )}
      {name}
    </Badge>
  )
}
