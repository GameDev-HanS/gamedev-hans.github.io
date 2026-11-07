import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  title?: string
  description?: string
}

// 페이지 안의 한 구역. 제목/설명은 선택.
export function Section({
  title,
  description,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-12 sm:py-16", className)} {...props}>
      <Container>
        {(title || description) && (
          <div className="mb-8 flex flex-col gap-2">
            {title && (
              <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
