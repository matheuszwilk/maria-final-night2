"use client";
import { useSideBarToggle } from "@/hooks/use-sidebar-toggle";
import classNames from "classnames";
import { ReactNode } from "react";

export default function PageWrapper({ children }: { children: ReactNode }) {
  const { toggleCollapse } = useSideBarToggle();
  const bodyStyle = classNames(
    "bg-background flex flex-col mt-16 py-2 px-4 h-full overflow-y-auto",
    {
      ["sm:pl-[17.1rem]"]: !toggleCollapse,
      ["sm:pl-[5.499rem]"]: toggleCollapse,
    }
  );

  return <div className={bodyStyle}>{children}</div>;
}
