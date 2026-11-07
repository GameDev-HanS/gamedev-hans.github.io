"use client"

import { BellIcon, InfoIcon } from "lucide-react"
import { toast } from "sonner"

import { Section } from "@/components/shared/section"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function DemoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">{children}</CardContent>
    </Card>
  )
}

export function ComponentShowcase() {
  return (
    <Section title="UI 컴포넌트" description="설치된 shadcn/ui 컴포넌트 예시입니다.">
      <div className="grid gap-4 md:grid-cols-2">
        <DemoCard title="Button">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </DemoCard>

        <DemoCard title="Badge · Avatar">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Avatar>
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
        </DemoCard>

        <DemoCard title="Dialog · Tooltip · Toast">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Dialog 열기
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>다이얼로그 예시</DialogTitle>
                <DialogDescription>
                  확인이 필요한 작업에 사용하세요.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
                <DialogClose
                  render={<Button />}
                  onClick={() => toast.success("확인했습니다")}
                >
                  확인
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
              <InfoIcon />
              <span className="sr-only">도움말</span>
            </TooltipTrigger>
            <TooltipContent>툴팁 내용입니다</TooltipContent>
          </Tooltip>
          <Button variant="secondary" onClick={() => toast("알림이 도착했습니다")}>
            <BellIcon data-icon="inline-start" />
            Toast
          </Button>
        </DemoCard>

        <DemoCard title="Switch">
          <div className="flex items-center gap-2">
            <Switch id="demo-switch" />
            <Label htmlFor="demo-switch">알림 받기</Label>
          </div>
        </DemoCard>

        <DemoCard title="Tabs">
          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="account">계정</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="pt-2 text-xs text-muted-foreground">
              계정 정보 탭입니다.
            </TabsContent>
            <TabsContent value="settings" className="pt-2 text-xs text-muted-foreground">
              설정 탭입니다.
            </TabsContent>
          </Tabs>
        </DemoCard>

        <DemoCard title="Accordion">
          <Accordion className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>스타터킷은 무료인가요?</AccordionTrigger>
              <AccordionContent>네, 자유롭게 사용할 수 있습니다.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>컴포넌트를 더 추가하려면?</AccordionTrigger>
              <AccordionContent>
                <code className="font-mono">npx shadcn add 이름</code>을 실행하세요.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DemoCard>
      </div>
    </Section>
  )
}
