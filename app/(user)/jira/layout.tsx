import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";
import "../jira/globals.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "H&A Tasks Management",
  description: "NextJs admin dashboard created by Matheus Pereira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          roboto.className,
          "antialiased min-h-screen overflow-y-scroll"
        )}
      >
        <ScrollArea className="h-full">
          <QueryProvider>
            <Toaster />
            {children}
          </QueryProvider>
        </ScrollArea>
      </body>
    </html>
  );
}
