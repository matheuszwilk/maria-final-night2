"use client";
import { SIDENAV_ITEMS } from "@/app/(user)/idle/menu_constants";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import SideBarMenuGroup from "@/components/sidebar-menu-group";
import { SideBarLogo } from "@/components/sidebar-logo";
import { DottedSeparator } from "@/components/dotted-separator";
import "@/app/globals.css";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@prisma/client";

export const IdleSideBar = () => {
  const [mounted, setMounted] = useState(false);
  const { toggleCollapse } = useSideBarToggle();
  const user = useCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;

  const asideStyle = classNames(
    "sidebar overflow-y-auto overflow-x-auto fixed bg-sidebar h-full shadow-sm shadow-slate-500/40 z-[99999] bg-sidebar",
    {
      ["w-[16.1rem] translate-x-0"]: !toggleCollapse,
      ["sm:w-[4.499rem] sm:translate-x-0 -translate-x-full"]: toggleCollapse,
    }
  );

  useEffect(() => setMounted(true), []);

  const filteredNavItems = SIDENAV_ITEMS.map((group) => {
    return {
      ...group,
      menuList: group.menuList.filter((item) => {
        // Filter out Configuration if user is not admin
        if (item.title === "Configuration" && !isAdmin) {
          return false;
        }
        return true;
      }),
    };
  }).filter((group) => group.menuList.length > 0);

  return (
    <aside className={asideStyle}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="sidebar-top flex items-center justify-center h-16 px-2 duration-600 mt-2">
            <div className="flex items-center justify-center w-full h-full">
              {mounted && <SideBarLogo />}
            </div>
          </div>
          <nav className="flex flex-col transition duration-300 ease-in-out">
            <div className="flex flex-col gap-2 px-4">
              {!toggleCollapse && (
                <div className="flex justify-center">
                  <h1 className="text-md font-semibold text-center text-black dark:text-white">
                    H&A Develop Experience
                  </h1>
                </div>
              )}

              {filteredNavItems.map((item, idx) => {
                return (
                  <React.Fragment key={idx}>
                    <SideBarMenuGroup menuGroup={item} />
                    {idx < filteredNavItems.length - 1 && <DottedSeparator />}
                  </React.Fragment>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
};
