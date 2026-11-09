"use client"

import { motion } from "motion/react"

import { STAGGER, fadeUp } from "@/lib/motion"

// 차례 등장: Stagger 안의 StaggerItem들이 위에서부터 STAGGER 간격으로 하나씩 나타납니다.
// inView를 켜면 처음 그려질 때가 아니라 화면에 들어올 때 한 번 재생합니다.
export function Stagger({
  delay = 0,
  inView = false,
  className,
  children,
}: {
  delay?: number
  inView?: boolean
  className?: string
  children: React.ReactNode
}) {
  const play = inView
    ? { whileInView: "show", viewport: { once: true, amount: 0.2 } }
    : { animate: "show" }

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...play}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: STAGGER, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

// data-motion: JS가 꺼진 브라우저에서는 app/layout.tsx의 <noscript> 규칙이 바로 보이게 합니다.
export function StaggerItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div data-motion className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}
