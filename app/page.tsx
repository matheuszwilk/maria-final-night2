import { Button } from "@/components/ui/button";
import { Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/login-button";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

const font = Roboto({ subsets: ["latin"], weight: ["500"] });

export default function Home() {
  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <main className="flex h-screen flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-40 w-40 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20" />
          <div className="relative z-10 space-y-6 text-center">
            <div className="relative mx-auto inline-block w-max">
              <div className="absolute left-0 top-[1px] text-foreground/80">
                <h1
                  className={cn(
                    "text-6xl md:text-7xl font-bold",
                    font.className
                  )}
                >
                  H&A Management Portal
                </h1>
              </div>
              <div className="relative text-foreground">
                <h1
                  className={cn(
                    "text-6xl md:text-7xl font-bold",
                    font.className
                  )}
                >
                  H&A Management Portal
                </h1>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern platform for efficient management and seamless
              collaboration
            </p>
            <LoginButton>
              <Button
                variant="secondary"
                size="lg"
                className="px-8 mt-6 py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Button>
            </LoginButton>
          </div>
        </div>
      </main>
    </BackgroundBeamsWithCollision>
  );
}
