"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";

interface CardWrapperProps {
  children: React.ReactNode;
  headerlabelMain: string;
  headerlabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerlabelMain,
  headerlabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <div className="flex flex-col w-11/12 md:max-w-lg justify-center items-center">
      <Card className="w-full justify-center items-center">
        <div className="w-full flex flex-col justify-center items-center">
          <div className=" w-full mx-auto flex flex-row items-center justify-end p-2">
            <ThemeSwitcher />
          </div>
          <Image
            src="/LGE_Logo_HeritageRed_Grey_RGB.png"
            alt="Image"
            width="135"
            height="135"
          />
        </div>
        <CardHeader>
          <Header labelMain={headerlabelMain} label={headerlabel} />
        </CardHeader>
        <CardContent>{children}</CardContent>
        {showSocial && (
          <CardFooter>
            <Social />
          </CardFooter>
        )}
        <CardFooter>
          <BackButton label={backButtonLabel} href={backButtonHref} />
        </CardFooter>
      </Card>
    </div>
  );
};
