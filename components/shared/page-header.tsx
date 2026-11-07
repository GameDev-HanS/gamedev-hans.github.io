import { cn } from "@/lib/utils"

type PageHeaderProps = React.ComponentProps<"div"> & {
  title: string
  description?: string
}

export function PageHeader({
  title,
  description,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 border-b pb-6", className)} {...props}>
      <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  )
}
