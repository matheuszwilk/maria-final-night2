import { Roboto } from "next/font/google";
import "@/app/globals.css";
import { Metadata } from "next";
import { auth } from "@/auth";
import React from "react";
import { Navbar } from "./_components/navbar";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "F6 admin dashboard",
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
    <html lang="en">
      <body className={roboto.className + " min-h-screen overflow-y-auto"}>
        <div className="min-h-screen w-full flex flex-col gap-y-2 items-center justify-center">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
