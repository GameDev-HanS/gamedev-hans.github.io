import { z } from "zod"

// 콘텐츠 로더(글·게임 기록)가 함께 쓰는 검증 조각

// URL에 그대로 쓰는 값(파일 이름, 태그, slug)은 영문 소문자·숫자·하이픈만 허용
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
export const SLUG_MESSAGE = "영문 소문자·숫자·하이픈만 쓸 수 있습니다 (예: game-programming)"

// 항목이 빠졌거나 형식이 다를 때 보여 줄 안내 (zod 기본 영어 메시지 대신)
export const required = (example: string) => ({ error: `필수 항목입니다 (예: ${example})` })

/** YYYY-MM-DD 형식이면서 실제로 있는 날짜 (2026-02-30 같은 값은 거부) */
export const dateString = (example: string) =>
  z
    .string(required(example))
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다")
    // 형식 검사가 실패해도 이 검사는 실행되므로, 해석할 수 없는 값은 여기서 걸러 예외 대신 메시지를 냅니다
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`)
      return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    }, "없는 날짜입니다")

/** zod 오류를 "필드: 메시지, ..." 한 줄로 */
export function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join(".") || "(전체)"}: ${issue.message}`).join(", ")
}
