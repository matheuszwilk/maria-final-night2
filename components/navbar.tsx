"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { UserNav } from "./usernav";
import { ThemeSwitcher } from "./theme-switcher";

const pathnameMap = {
  tasks: {
    title: "My Tasks",
    description: "View all of your tasks here",
  },
  projects: {
    title: "My Project",
    description: "View tasks of your project here",
  },
};

const defaultMap = {
  title: "Dashboard",
  description: "Monitor and manage your tasks and projects",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <div className="flex items-center gap-x-2">
        <ThemeSwitcher />
        <UserNav />
      </div>
    </nav>
  );
};
