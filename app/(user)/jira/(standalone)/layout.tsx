import Image from "next/image";
import Link from "next/link";
import { UserNav } from "@/components/usernav";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface StandloneLayoutProps {
  children: React.ReactNode;
}

const StandloneLayout = ({ children }: StandloneLayoutProps) => {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center h-[73px]">
          <Link href="/jira">
            <Image src="/logo.svg" alt="logo" width={90} height={36} />
          </Link>
          <div className="flex items-center gap-x-2">
            <ThemeSwitcher />
            <UserNav />
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandloneLayout;
