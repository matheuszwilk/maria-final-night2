import Header from "@/components/header";
import PageWrapper from "@/components/pagewrapper";
import "@/app/globals.css";
import { Roboto } from "next/font/google";
import { AndonSideBar } from "./_components/sidebar";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "H&A Idle Management",
  description: "NextJs admin dashboard created by Matheus Pereira",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${roboto.variable} font-sans antialiased`}>
      <AndonSideBar />
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <PageWrapper>{children}</PageWrapper>
        <Toaster />
      </div>
    </div>
  );
}
