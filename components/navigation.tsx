"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function Navigation() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" className={cn(navigationMenuTriggerStyle(), "text-lg font-semibold")}>
                Material Handling
              </Link>
            </NavigationMenuItem>

            {/* <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[400px] p-4">
                  <div className="space-y-3">
                    <Link href="/products">
                      <NavigationMenuLink>
                        All Products
                      </NavigationMenuLink>
                    </Link>
                    <Link href="/products/equipment">
                      <NavigationMenuLink>
                        Equipment
                      </NavigationMenuLink>
                    </Link>
                    <Link href="/products/solutions">
                      <NavigationMenuLink>
                        Solutions
                      </NavigationMenuLink>
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" className={navigationMenuTriggerStyle()}>
                About
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" className={navigationMenuTriggerStyle()}>
                Contact
              </Link>
            </NavigationMenuItem> */}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
