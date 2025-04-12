import "./globals.css";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "H&A Portal Management",
  description: "NextJs admin dashboard created by Matheus Pereira",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("session", session);
  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={roboto.className + " h-screen overflow-hidden"}>
          <ThemeProvider
            themes={["dark", "light", "custom"]}
            defaultTheme="dark"
            attribute="class"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </SessionProvider>
  );
}
