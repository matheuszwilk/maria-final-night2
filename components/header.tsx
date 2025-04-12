"use client";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import classNames from "classnames";
import { UserNav } from "./usernav";
import { ThemeSwitcher } from "./theme-switcher";
import { PanelLeft } from "lucide-react";

export default function Header() {
  const { toggleCollapse, invokeToggleCollapse } = useSideBarToggle();
  const sidebarToggle = () => {
    invokeToggleCollapse();
  };
  const headerStyle = classNames(
    "bg-sidebar fixed top-0 right-0 z-[99997] px-4 border-b",
    {
      ["sm:left-[16.1rem] left-1"]: !toggleCollapse,
      ["sm:left-[4.499rem] left-0"]: toggleCollapse,
    }
  );
  return (
    <header className={headerStyle}>
      <div className="h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={sidebarToggle}
            className="order-2 sm:order-1 shrink-btn float-right text-sidebar-muted-foreground hover:bg-foreground hover:text-background rounded-md w-[15px] h-[15px] flex items-center justify-center shadow-md shadow-black/10  transition duration-300 ease-in-out"
          >
            <PanelLeft />
          </button>
        </div>

        <div className="flex items-center justify-between sm:order-2 order-1">
          <div className="p-2">
            <ThemeSwitcher></ThemeSwitcher>
          </div>
          <div className="h-10 w-10 rounded-full bg-sidebar-muted flex items-center justify-center text-center">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
