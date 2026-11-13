import { Container } from "@/components/layout/container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Profile } from "@/lib/content"

// 이름 이니셜. 한 단어면 첫 글자 1자("HanS" → "H"), 띄어쓰기로 나뉘면 앞 두 단어의 첫 글자("Han Seo" → "HS").
// Array.from으로 나눠 한글·이모지도 한 글자로 셉니다.
function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase()
}

// 홈 히어로 아래의 프로필 (2026-11-13 소개 페이지를 홈으로 합침). 사진(없으면 이니셜) 왼쪽,
// 이름·소개·관심 분야·공부 중인 것 오른쪽. 모바일에서는 사진 아래로 글이 쌓입니다. 빈 목록은 줄째 숨깁니다.
// 페이지 제목(h1)은 히어로에 있으므로 이름은 h2입니다.
export function ProfileIntro({ profile }: { profile: Profile }) {
  const lists = [
    { label: "관심 분야", items: profile.interests },
    { label: "지금 공부 중", items: profile.studying },
  ].filter((list) => list.items.length > 0)

  return (
    <section className="border-b py-12 sm:py-16">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
        {/* 사진이 없거나 불러오지 못하면(로드 전 포함) 이니셜이 보입니다. basePath 대응은 T-310 */}
        {/* 사진 원본 비율(세로 3:4)의 각진 네모. shadcn Avatar 기본 원형·정사각형을 덮어씀 */}
        <Avatar className="h-28 w-21 rounded-none after:rounded-none sm:h-36 sm:w-27">
          {profile.photo && <AvatarImage src={profile.photo} alt={profile.name} className="rounded-none" />}
          <AvatarFallback className="rounded-none bg-linear-to-br from-primary/20 to-card font-heading text-3xl font-bold text-primary sm:text-4xl">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{profile.name}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{profile.tagline}</p>
          </div>

          {lists.length > 0 && (
            <dl className="flex flex-col gap-3">
              {lists.map((list) => (
                <div key={list.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
                  <dt className="shrink-0 pt-0.5 text-xs font-medium text-muted-foreground sm:w-24">{list.label}</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-1.5">
                      {list.items.map((item) => (
                        <li key={item}>
                          <Badge variant="secondary">{item}</Badge>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
    </section>
  )
}
