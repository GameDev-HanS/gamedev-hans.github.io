"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

import { fadeUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

// 스크롤해서 화면에 들어올 때마다 아래에서 살짝 올라오며 나타납니다 (화면 밖으로 나가면 다시 숨겨져, 돌아오면 또 재생).
// 목록에서는 as="li"로 항목마다 따로 씁니다 → 목록이 길어도 각 항목이 자기 차례에 나타남.
//
// 감시와 움직임을 나눕니다 (T-128): 바깥 요소(움직이지 않음)가 화면에 20% 이상 보이는지 재고,
// 안쪽 요소만 움직입니다. 같은 요소가 재면서 움직이면, 짧은 항목이 화면 위쪽 가장자리에 걸칠 때
// 숨김(8px 내려감) → 다시 20% 보임 → 표시 → … 가 반복되며 깜빡일 수 있기 때문입니다.
// className은 안쪽 요소에 붙습니다 (h-full: 그리드에서 카드 높이를 줄에 맞춤).
// data-motion: JS가 꺼진 브라우저에서는 app/layout.tsx의 <noscript> 규칙이 바로 보이게 합니다.
export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "li"
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null)
  const inView = useInView(ref, { amount: 0.2 })
  const Outer = as

  return (
    <Outer ref={ref}>
      <motion.div
        data-motion
        className={cn("h-full", className)}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        // inherit: MotionConfig의 공통 시간·곡선에 delay만 더함
        transition={{ inherit: true, delay }}
      >
        {children}
      </motion.div>
    </Outer>
  )
}
