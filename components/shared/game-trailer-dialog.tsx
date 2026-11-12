"use client"

import { useState } from "react"
import { ExternalLinkIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// 카드 위를 덮는 투명 버튼. 누르면 팝업에서 공식 PV를 재생합니다.
// 카드 내용(제목·날짜 등)은 버튼 밖에 그대로 있어 화면 낭독기가 읽을 수 있습니다. 부모는 relative여야 합니다.
// 개인정보·속도: 팝업이 열렸을 때만 유튜브(youtube-nocookie) iframe을 그리므로, 누르기 전에는 유튜브로 요청이 가지 않습니다.
// 닫으면 iframe이 사라져 재생도 멈춥니다.
export function GameTrailerDialog({ videoId, title }: { videoId: string; title: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={`${title} PV 보기`}
        className="absolute inset-0 z-10 cursor-pointer outline-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-primary"
      />
      {/* 기본 닫기 버튼은 화면 낭독기에 영어("Close")로 읽혀서, 한국어 이름의 닫기 버튼을 직접 둡니다 */}
      <DialogContent showCloseButton={false} className="gap-3 sm:max-w-3xl">
        <DialogTitle className="pr-8 font-heading text-sm">{title} PV</DialogTitle>
        <DialogClose
          render={<Button variant="ghost" size="icon-sm" className="absolute top-2 right-2" />}
        >
          <XIcon />
          <span className="sr-only">닫기</span>
        </DialogClose>
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {open && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`${title} PV`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full"
            />
          )}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 justify-self-end text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          YouTube에서 보기
          <ExternalLinkIcon aria-hidden className="size-3" />
        </a>
      </DialogContent>
    </Dialog>
  )
}
