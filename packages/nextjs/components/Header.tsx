"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ThemeToggle";
import { Book, Bug, CreditCard, DollarSign, Menu, Rocket, Users, Video } from "lucide-react";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "~~/components/ui/navigation-menu";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

// Import Lucide icons

const routes = [
  { name: "Home", href: "/", icon: "" },
  // { name: "Debug Contracts", href: "/debug", icon: <Bug className="h-4 w-4" /> }, // Use Lucide Bug icon
  { name: "TheFlix DAO", href: "/dao", icon: <Users className="h-5 w-5" /> }, // Use Lucide Users icon
  { name: "Flix Starter", href: "/flixstarter", icon: <Rocket className="h-5 w-5" /> }, // Use Lucide CreditCard icon
  { name: "Investments", href: "/invdash", icon: <DollarSign className="h-5 w-5" /> },
  { name: "Theatre", href: "/theatre", icon: <Video className="h-5 w-5" /> }, // Use Lucide Video icon
  { name: "Faucet", href: "/faucet", icon: <CreditCard className="h-5 w-5" /> }, // Use Lucide CurrencyDollar icon
  { name: "D", href: "/docs", icon: <Book className="h-5 w-5" /> },
] as const;

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const pathname = usePathname();

  return (
    <header className="sticky lg:static top-0 flex container justify-around shadow-md shadow-secondary px-0 sm:px-2">
      <aside className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`ml-1 ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
              onClick={() => {
                setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
              }}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          {isDrawerOpen && (
            <DropdownMenuContent align="end">
              <NavigationMenu className="flex flex-col gap-2 text-2xl">
                {" "}
                {/* Make NavigationMenu vertical */}
                {routes.map(({ name, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                    <NavigationMenuItem key={href} className="list-none items-center">
                      <NavigationMenuLink
                        href={href}
                        className={`${
                          isActive ? "bg-foreground/20 shadow-md" : ""
                        } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
                      >
                        {icon}
                        <span>{name}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenu>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </aside>
      <aside className="flex items-center gap-2 ml-4 mr-6 shrink-0">
        <Link href="/" passHref className="flex flex-row p-2 gap-4">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.png" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">CrowdFlix</span>
            <span className="text-xs">the Decentralized OTT</span>
          </div>
        </Link>
      </aside>
      <aside className="hidden lg:flex items-center">
        <nav className="">
          <NavigationMenu>
            {routes.map(({ name, href, icon }) => {
              const isActive = pathname === href;
              return (
                <NavigationMenuItem key={href} className="list-none">
                  <NavigationMenuLink
                    href={href}
                    className={`${
                      isActive ? "bg-foreground/30 shadow-md" : ""
                    } hover:bg-foreground/20 hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 rounded-full gap-2 grid grid-flow-col`}
                  >
                    {icon}
                    <span>{name}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenu>
        </nav>
      </aside>
      <aside className="flex items-center justify-between">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
        <ModeToggle />
      </aside>
    </header>
  );
};
