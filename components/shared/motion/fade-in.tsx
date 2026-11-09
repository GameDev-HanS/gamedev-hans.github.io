"use client"

import { motion } from "motion/react"

import { fadeUp } from "@/lib/motion"

// 화면에 처음 그려질 때 아래에서 살짝 올라오며 나타납니다. delay(초)로 시작을 늦출 수 있습니다.
// data-motion: JS가 꺼진 브라우저에서는 app/layout.tsx의 <noscript> 규칙이 바로 보이게 합니다.
export function FadeIn({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      data-motion
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      // inherit: MotionConfig의 공통 시간·곡선에 delay만 더함
      transition={{ inherit: true, delay }}
    >
      {children}
    </motion.div>
  )
}
