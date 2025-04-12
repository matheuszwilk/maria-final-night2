import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });

interface HeaderProps {
  labelMain: string;
  label: string;
}

export const Header = ({ labelMain, label }: HeaderProps) => {
  return (
    <div
      className="
        'flex flex-col w-full justify-center items-center gap-y-40 text-center"
    >
      <h1 className={cn("text-2xl font-bold", font.className)}>{labelMain}</h1>
      <p className="text-balance text-muted-foreground">{label}</p>
    </div>
  );
};
