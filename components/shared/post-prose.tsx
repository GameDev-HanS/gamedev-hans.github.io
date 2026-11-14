import type { ReactNode } from "react"

// 글 본문 서식: @tailwindcss/typography의 prose + 포인트 색(시안) 링크. 한국어·영어 글 상세가 함께 씁니다.
export function PostProse({ children }: { children: ReactNode }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 prose-blockquote:border-primary prose-blockquote:not-italic prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-img:mx-auto">
      {children}
    </div>
  )
}
