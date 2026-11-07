import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { ComponentShowcase } from "@/components/sections/component-showcase"
import { ExampleForm } from "@/components/sections/example-form"
import { PageHeader } from "@/components/shared/page-header"
import { Section } from "@/components/shared/section"

export const metadata: Metadata = {
  title: "컴포넌트",
  description: "스타터킷에 포함된 UI 컴포넌트와 폼 예제",
}

export default function ComponentsPage() {
  return (
    <>
      <Container className="pt-12">
        <PageHeader
          title="컴포넌트"
          description="스타터킷에 포함된 shadcn/ui 컴포넌트와 폼 검증 예제입니다."
        />
      </Container>
      <ComponentShowcase />
      <Section
        title="폼"
        description="react-hook-form + zod + shadcn Field 조합"
        className="pt-0"
      >
        <ExampleForm />
      </Section>
    </>
  )
}
