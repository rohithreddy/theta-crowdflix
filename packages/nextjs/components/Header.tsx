"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ThemeToggle";
import { BanknotesIcon, Bars3Icon, BugAntIcon, UserGroupIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "~~/@/components/ui/navigation-menu";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const routes = [
  { name: "Home", href: "/", icon: "" },
  { name: "Debug Contracts", href: "/debug", icon: <BugAntIcon className="h-4 w-4" /> },
  { name: "Join Flix DAO", href: "/joindao", icon: <UserGroupIcon className="h-4 w-4" /> },
  { name: "Theatre", href: "/theatre", icon: <VideoCameraIcon className="h-4 w-4" /> },
  { name: "Flix Starter", href: "/flixstarter", icon: <BanknotesIcon className="h-4 w-4" /> },
  { name: "Faucet", href: "/faucet", icon: <BanknotesIcon className="h-4 w-4" /> },
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
    <header className="sticky lg:static top-0 flex justify-between shadow-md shadow-secondary px-0 sm:px-2">
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
              <Bars3Icon className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          {isDrawerOpen && (
            <DropdownMenuContent align="end">
              <NavigationMenu>
                {routes.map(({ name, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                    <NavigationMenuItem key={href} className="list-none">
                      <NavigationMenuLink
                        href={href}
                        className={`${
                          isActive ? "bg-secondary shadow-md" : ""
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
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">CrowdFlix</span>
            <span className="text-xs">the Decentralized OTT</span>
          </div>
        </Link>
      </aside>
      <aside className="items-center flex">
        <nav className="">
          <NavigationMenu>
            {routes.map(({ name, href, icon }) => {
              const isActive = pathname === href;
              return (
                <NavigationMenuItem key={href} className="list-none">
                  <NavigationMenuLink
                    href={href}
                    className={`${
                      isActive ? "bg-secondary shadow-md" : ""
                    } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
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
      <aside className="flex items-center mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
        <ModeToggle />
      </aside>
    </header>
  );
};
