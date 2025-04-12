"use client";
import "@/app/globals.css";
import localFont from "next/font/local";

const roboto = localFont({
  src: "../../fonts/Roboto-Regular.ttf",
  variable: "--font-roboto",
});

export default function SelectProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${roboto.variable} font-sans antialiased`}>
      <div className="flex flex-col h-screen overflow-hidden">{children}</div>
    </div>
  );
}
