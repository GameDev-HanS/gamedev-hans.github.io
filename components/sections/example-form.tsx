"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const topics = [
  { label: "일반 문의", value: "general" },
  { label: "버그 제보", value: "bug" },
  { label: "기능 제안", value: "feature" },
]

const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력하세요."),
  email: z.email("올바른 이메일 주소를 입력하세요."),
  topic: z.string().min(1, "문의 유형을 선택하세요."),
  message: z
    .string()
    .min(10, "내용은 10자 이상 입력하세요.")
    .max(500, "내용은 500자 이하로 입력하세요."),
  agree: z.boolean().refine((v) => v, "개인정보 수집에 동의해야 합니다."),
})

type FormValues = z.infer<typeof formSchema>

export function ExampleForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", topic: "", message: "", agree: false },
  })

  function onSubmit(values: FormValues) {
    toast.success("문의가 접수되었습니다", {
      description: `${values.name}님, 확인 후 답변드리겠습니다.`,
    })
    form.reset()
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>문의하기</CardTitle>
        <CardDescription>
          react-hook-form + zod 검증 예제입니다. 비워 두고 제출해 보세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="example-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>이름</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>이메일</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="topic"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>문의 유형</FieldLabel>
                  <Select
                    items={topics}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>내용</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={4}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="agree"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldLabel htmlFor={field.name}>개인정보 수집에 동의합니다</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          초기화
        </Button>
        <Button type="submit" form="example-form">
          제출
        </Button>
      </CardFooter>
    </Card>
  )
}
