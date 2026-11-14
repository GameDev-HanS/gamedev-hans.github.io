"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { fadeUp } from "@/lib/motion"
import { getNavItems, isNavActive } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {getNavItems(pathname).map((item) => {
          const active = isNavActive(pathname, item.href)
          return (
            // 메뉴 항목이 헤더 Stagger 안에서 왼쪽부터 차례로 나타남 (data-motion: JS가 꺼지면 바로 보임)
            <NavigationMenuItem key={item.href} render={<motion.li data-motion variants={fadeUp} />}>
              <NavigationMenuLink
                active={active}
                className={cn(
                  navigationMenuTriggerStyle(),
                  // navigationMenuTriggerStyle의 transition-all이 link-hover의 동작 줄이기 규칙보다 우선이라 따로 꺼 줌
                  "link-hover motion-reduce:transition-none",
                  active && "text-primary"
                )}
                render={<Link href={item.href} />}
              >
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
