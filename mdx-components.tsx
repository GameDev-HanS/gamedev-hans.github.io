import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import type { ComponentProps } from "react"

import { CodeBlock } from "@/components/shared/code-block"
import { cn } from "@/lib/utils"

// MDX 본문에 쓰는 전역 컴포넌트 (App Router에서 @next/mdx를 쓰려면 이 파일이 반드시 있어야 함).
// 글자 서식은 글 상세 페이지의 prose(@tailwindcss/typography)가 맡고, 여기서는 동작이 다른 요소만 바꿉니다.
const components: MDXComponents = {
  // 사이트 안 링크는 next/link로(페이지 이동이 빠름), 외부 링크는 새 탭으로
  a: ({ href = "", children, ...props }) => {
    // "//example.com"(프로토콜 상대 주소)은 외부 주소이므로 내부 링크에서 제외
    if (href.startsWith("/") && !href.startsWith("//")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      )
    }
    const external = /^(https?:)?\/\//.test(href)
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    )
  },
  // 본문 이미지는 크기를 미리 알 수 없어 next/image 대신 img를 쓰고, 화면 폭을 넘지 않게 함
  img: ({ alt = "", className, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} loading="lazy" {...props} className={cn("h-auto max-w-full", className)} />
  ),
  // 코드 블록은 전용 패널로 (T-301). 언어는 rehype-pretty-code가 pre에 넣는 data-language에서 받고,
  // 언어를 적지 않은 블록은 이 값이 없어 상단 바 없이 패널만 보입니다.
  pre: (props: ComponentProps<"pre"> & { "data-language"?: string }) => (
    <CodeBlock language={props["data-language"]} {...props} />
  ),
}

export function useMDXComponents(): MDXComponents {
  return components
}
