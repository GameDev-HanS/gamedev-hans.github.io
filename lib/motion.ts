// 사이트 공통 애니메이션 값. 모든 효과가 이 값을 써서 같은 리듬으로 움직입니다 (은은하게).
// 이동은 transform(y)와 opacity만 씁니다 (레이아웃이 밀리지 않고 GPU로 부드럽게 처리됨).

/** 한 번의 등장에 걸리는 시간 (초) */
export const DURATION = 0.35
/** 아래에서 올라오는 거리 (px) */
export const DISTANCE = 8
/** 차례 등장할 때 항목 사이 간격 (초) */
export const STAGGER = 0.06
/** 빠르게 시작해 부드럽게 멈추는 곡선 */
export const EASE = [0.22, 1, 0.36, 1] as const

/** 카드 호버 때 떠오르는 거리 (px) */
export const HOVER_LIFT = 4
/** 카드 호버 때 마우스를 따라 기우는 최대 각도 (도) */
export const HOVER_TILT = 3
/** 카드 기울기의 원근 거리 (px, 작을수록 입체감이 강함) */
export const HOVER_PERSPECTIVE = 800
/** 기울기가 마우스를 부드럽게 따라가게 하는 spring */
export const HOVER_SPRING = { stiffness: 300, damping: 25 }

/** 등장 전·후 상태 (Stagger·Reveal이 함께 씀) */
export const fadeUp = {
  hidden: { opacity: 0, y: DISTANCE },
  show: { opacity: 1, y: 0 },
}
