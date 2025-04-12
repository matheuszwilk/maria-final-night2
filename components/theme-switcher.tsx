"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, Palette } from "lucide-react";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  const isActive = (themeName: string) => {
    return theme === themeName && <CheckIcon className="ml-2 h-2 w-2" />;
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 rounded-full"
        >
          <Palette className="w-2 h-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[99998]">
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <span>Dark</span>
          {isActive("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <span>Light</span>
          {theme === "light" && <CheckIcon className="ml-2 h-2 w-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
