"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { siteConfig } from "@/config/site"
import { isNavActive } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {siteConfig.mainNav.map((item) => {
          const active = isNavActive(pathname, item.href)
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                active={active}
                className={cn(
                  navigationMenuTriggerStyle(),
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
