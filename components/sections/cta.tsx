import { Section } from "@/components/shared/section"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export function Cta() {
  return (
    <Section className="border-t bg-muted/40">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="text-sm text-muted-foreground">
            저장소를 클론하고 <code className="font-mono">npm run dev</code>만
            실행하면 됩니다.
          </p>
        </div>
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg" })}
        >
          GitHub에서 보기
        </a>
      </div>
    </Section>
  )
}
