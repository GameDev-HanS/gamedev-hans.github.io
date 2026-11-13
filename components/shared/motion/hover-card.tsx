"use client"

import { useEffect, useState, type PointerEvent, type ReactNode } from "react"
import { motion, useReducedMotion, useSpring } from "motion/react"

import { HOVER_LIFT, HOVER_PERSPECTIVE, HOVER_SPRING, HOVER_TILT } from "@/lib/motion"
import { cn } from "@/lib/utils"

// 카드 호버 효과 공통 래퍼 (글 카드, 이후 프로젝트 카드·게임 줄도 사용)
// - 마우스: 살짝 떠오르고, 카드 안의 마우스 위치를 따라 몇 도 기웁니다.
// - 터치: Motion의 hover는 터치를 무시하므로 기울기·떠오름 없이 누름 효과(0.98배)만 있습니다.
// - 동작 줄이기: 기울기·떠오름·누름을 모두 끄고 테두리 강조만 남깁니다.
// transform만 바꾸므로 주변 카드가 밀리지 않습니다.
//
// 구조: 바깥 div는 움직이지 않고 호버·누름·마우스 위치만 받고, 안쪽 div(className)만 움직입니다.
// (움직이는 요소가 직접 호버를 받으면 카드 가장자리에서 떠오름이 켜졌다 꺼졌다 하며 떨리고,
//  기울어진 크기로 마우스 위치를 재서 값이 어긋남)
// 쓰는 쪽은 HoverCard를 링크(.group) 안에 두고, 테두리 강조는 className에 accent-hover-in-group을 줍니다.
// 링크가 제자리에 있으므로 카드가 떠올라도 아래 가장자리까지 클릭·호버가 되고, 키보드 포커스는 링크가 받습니다.
// 테두리 강조는 CSS라서 동작 줄이기에서도 보입니다.
// 호버·누름 상태는 바깥에서 받아 안쪽 animate로 직접 넘깁니다.
// (variant 라벨 전파는 마우스로 호버 중에 누르면 안쪽에 누름이 전달되지 않음 — 테스트에서 확인)
// overlay: 바깥(움직이지 않는) div에 그리는 요소. 게임 줄처럼 링크 대신 카드 전체를 덮는 버튼을 쓸 때,
// 버튼을 여기 두면 버튼은 제자리에 있고(클릭 영역이 떠오르지 않음) 호버·누름은 바깥 div로 전달됩니다.
// 이때 바깥의 .group은 쓰는 쪽이 감싸고, 키보드 포커스 강조는 accent-hover-in-group의 :has(:focus-visible)가 켭니다.
export function HoverCard({
  className,
  overlay,
  children,
}: {
  className?: string
  overlay?: ReactNode
  children: ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const rotateX = useSpring(0, HOVER_SPRING)
  const rotateY = useSpring(0, HOVER_SPRING)

  // 호버 중에 동작 줄이기가 켜지면 남아 있던 기울기를 되돌림
  useEffect(() => {
    if (reduceMotion) {
      rotateX.jump(0)
      rotateY.jump(0)
    }
  }, [reduceMotion, rotateX, rotateY])

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return
    // overlay의 팝업(포털)에서 올라온 이벤트는 무시 (React 이벤트는 포털을 지나 부모로 전달되므로,
    // 팝업이 열린 채 마우스를 움직이면 뒤의 카드가 기울 수 있음)
    if (!event.currentTarget.contains(event.target as Node)) return
    const rect = event.currentTarget.getBoundingClientRect()
    // 카드 가운데를 0으로 한 마우스 위치 (-0.5 ~ 0.5)
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    // 마우스가 있는 쪽이 살짝 눌려 들어가는 방향으로 기울임
    rotateY.set(x * 2 * HOVER_TILT)
    rotateX.set(-y * 2 * HOVER_TILT)
  }

  function handlePointerLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      // hover:z-10: 기울어진 모서리가 옆 카드 위로 보이게 함
      className="relative h-full hover:z-10"
      // Motion의 hover는 터치를 무시하므로 터치 기기에서는 hovered가 켜지지 않음
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      // 누름: CSS :active는 터치에서 안정적이지 않아 Motion의 tap 이벤트로 처리
      onTapStart={() => setPressed(true)}
      onTap={() => setPressed(false)}
      onTapCancel={() => setPressed(false)}
      // tap 이벤트를 쓰면 Motion이 이 div에 tabindex="0"을 붙여 Tab이 카드마다 두 번 멈추므로 -1로 막습니다
      // (포커스는 바깥 링크만 받음)
      tabIndex={-1}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className={cn("h-full", className)}
        // 동작 줄이기: MotionConfig는 transform을 '애니메이션 없이 즉시' 적용할 뿐 없애지 않으므로 여기서 직접 끕니다
        animate={
          reduceMotion
            ? { y: 0, scale: 1 }
            : { y: hovered ? -HOVER_LIFT : 0, scale: pressed ? 0.98 : 1 }
        }
        style={{ rotateX, rotateY, transformPerspective: HOVER_PERSPECTIVE }}
      >
        {children}
      </motion.div>
      {overlay}
    </motion.div>
  )
}
