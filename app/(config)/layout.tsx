import Image from "next/image";
import Link from "next/link";
import { UserNav } from "@/components/usernav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { Roboto } from "next/font/google";
import { Metadata } from "next";

interface StandloneLayoutProps {
  children: React.ReactNode;
}

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "F6 Config dashboard",
  description: "NextJs admin dashboard created by Matheus Pereira",
};

const StandloneLayout = ({ children }: StandloneLayoutProps) => {
  return (
    <ScrollArea className="h-screen w-full">
      <main className={`bg-background h-screen ${roboto.variable}`}>
        <div className="mx-auto max-w-screen-2xl p-4">
          <nav className="flex justify-between items-center h-[73px]">
            <Link href="/projects">
              <Image src="/logo.svg" alt="logo" width={90} height={36} />
            </Link>
            <div className="flex items-center gap-x-2">
              <ThemeSwitcher />
              <UserNav />
            </div>
          </nav>
          <div className="flex flex-col items-center justify-center py-4 overflow-y-auto w-full h-full">
            <Toaster />
            {children}
          </div>
        </div>
      </main>
    </ScrollArea>
  );
};

export default StandloneLayout;
