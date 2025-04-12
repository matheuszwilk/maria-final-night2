import { useTheme } from "next-themes";
import Image from "next/image";

export const SideBarLogo = () => {
  const { theme } = useTheme();
  return <Image src="/logo.svg" alt="logo" width={90} height={36} />;
};
