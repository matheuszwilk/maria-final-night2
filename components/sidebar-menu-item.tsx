"use client";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import { SideNavItem } from "@/types/type";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import "@/app/globals.css";

export const SideBarMenuItem = ({ item }: { item: SideNavItem }) => {
  const { toggleCollapse } = useSideBarToggle();

  const pathname = usePathname();

  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  const inactiveLink = classNames(
    "flex items-center min-h-[40px] h-full text-sidebar-foreground py-2 px-4 hover:text-sidebar-muted-foreground hover:bg-sidebar-muted rounded-md transition duration-200",
    { ["justify-center"]: toggleCollapse }
  );

  const activeLink = classNames(
    "text-sidebar-muted-foreground bg-muted",
    "dark:text-sidebar-foreground dark:bg-muted"
  );

  const navMenuDropdownItem =
    "text-red py-2 px-4 hover:text-sidebar-muted-foreground transition duration-200 rounded-md";

  const dropdownMenuHeaderLink = classNames(inactiveLink, {
    ["bg-sidebar-muted rounded-b-none"]: subMenuOpen,
  });
  return (
    <>
      {item.submenu ? (
        <div className="min-w-[18px]">
          <a
            className={`${dropdownMenuHeaderLink} ${
              pathname.includes(item.path) ? activeLink : ""
            }`}
            onClick={toggleSubMenu}
          >
            <div className="max-w-[20px]">{item.icon}</div>
            {!toggleCollapse && (
              <>
                <span className="ml-2 text-sm leading-6">
                  {item.title}
                </span>
                <BsChevronRight
                  className={`${
                    subMenuOpen ? "rotate-90" : ""
                  } ml-auto stroke-2 text-sm`}
                />
              </>
            )}
          </a>
          {subMenuOpen && !toggleCollapse && (
            <div className="bg-sidebar-muted border-l-4">
              <div className="grid gap-y-1 px-6 leading-2 py-2">
                {item.subMenuItems?.map((subItem, idx) => {
                  return (
                    <Link
                      key={idx}
                      href={subItem.path}
                      className={`${navMenuDropdownItem} ${
                        subItem.path === pathname
                          ? " text-sidebar-muted-foreground text-sm"
                          : " text-sidebar-foreground text-sm"
                      }`}
                    >
                      <span>{subItem.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          href={item.path}
          className={`${inactiveLink} ${
            item.path === pathname ? activeLink : ""
          }`}
        >
          <div className="max-w-[20px]">{item.icon}</div>
          {!toggleCollapse && (
            <span className="ml-3 text-sm leading-6">{item.title}</span>
          )}
        </Link>
      )}
    </>
  );
};
