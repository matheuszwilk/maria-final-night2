import { LeftForm } from "@/components/auth/left-form";
import { RegisterForm } from "@/components/auth/register-form";

import React from "react";
const LoginPage = () => {
  return (
    <div className="lg:grid lg:h-full lg:w-full lg:grid-cols-2 xl:h-full xl:w-full xl:grid-cols-2">
      <div className="w-full flex-col gap-y-4 items-center justify-center bg-muted lg:block hidden">
        <LeftForm />
      </div>
      <div className="w-full flex flex-col items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
};

export default LoginPage;
