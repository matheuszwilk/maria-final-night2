import Image from "next/image";
import Link from "next/link";

import { Projects } from "@/components/projects";
import { Navigation } from "@/components/navigation";
import { DottedSeparator } from "@/components/dotted-separator";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-sidebar p-4 w-full border-r border-border/40">
      <Link href="/jira" className="flex justify-center">
        <Image src="/logo.svg" alt="logo" width={90} height={36} />
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Projects />
    </aside>
  );
};
