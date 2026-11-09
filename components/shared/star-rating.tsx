import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// 5점 만점 별점. 별은 장식이고, 화면 낭독기에는 "5점 만점에 n점"을 읽어 줍니다.
export function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={cn("size-3.5", index < value ? "fill-current text-primary" : "text-muted-foreground/40")}
        />
      ))}
      <span className="sr-only">5점 만점에 {value}점</span>
    </div>
  )
}
