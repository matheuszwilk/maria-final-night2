"use client";
import { SIDENAV_ITEMS } from "@/app/(user)/andon/menu_constants";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import SideBarMenuGroup from "./sidebar-menu-group";
import { SideBarLogo } from "./sidebar-logo";
import { DottedSeparator } from "./dotted-separator";
import "@/app/globals.css";

export const SideBar = () => {
  const [mounted, setMounted] = useState(false);
  const { toggleCollapse } = useSideBarToggle();

  const asideStyle = classNames(
    "sidebar overflow-y-auto overflow-x-auto fixed bg-sidebar h-full shadow-sm shadow-slate-500/40 z-[99999] bg-sidebar",
    {
      ["w-[19.1rem] translate-x-0"]: !toggleCollapse,
      ["sm:w-[4.499rem] sm:translate-x-0 -translate-x-full"]: toggleCollapse,
    }
  );

  useEffect(() => setMounted(true), []);

  return (
    <aside className={asideStyle}>
      <div className="sidebar-top flex items-center justify-center h-16 px-2 duration-600">
        <div className="flex items-center justify-center w-full h-full">
          {mounted && <SideBarLogo />}
        </div>
      </div>
      <nav className="flex flex-col transition duration-300 ease-in-out">
        <div className="flex flex-col gap-2 px-4">
          {!toggleCollapse && (
            <div className="flex justify-center">
              <h1 className="text-xl font-semibold text-center text-black dark:text-white">
                H&A Develop Experience
              </h1>
            </div>
          )}
          {SIDENAV_ITEMS.map((item, idx) => {
            return (
              <React.Fragment key={idx}>
                <SideBarMenuGroup menuGroup={item} />
                {idx < SIDENAV_ITEMS.length - 1 && <DottedSeparator />}
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};
