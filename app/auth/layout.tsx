import React from "react";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      defaultTheme="light"
      themes={["dark", "custom", "light"]}
      attribute="class"
      enableSystem
      disableTransitionOnChange
    >
      <div className="h-screen flex items-center justify-center">
        {children}
      </div>
    </ThemeProvider>
  );
};

export default AuthLayout;
