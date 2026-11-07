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

export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {siteConfig.mainNav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                active={active}
                className={navigationMenuTriggerStyle()}
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
