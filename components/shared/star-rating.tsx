import { StarIcon } from "lucide-react"

import { UI, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// 5점 만점 별점. 별은 장식이고, 화면 낭독기에는 "5점 만점에 n점"(영어: "n out of 5 stars")을 읽어 줍니다.
export function StarRating({
  value,
  locale = "ko",
  className,
}: {
  value: number
  locale?: Locale
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={cn("size-3.5", index < value ? "fill-current text-primary" : "text-muted-foreground/40")}
        />
      ))}
      <span className="sr-only">{UI[locale].games.rating(value)}</span>
    </div>
  )
}
