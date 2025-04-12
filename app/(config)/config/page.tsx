import React from "react";
import { TabsConfig } from "@/app/(config)/config/_components/tabs-config";

const DepartamentsPage = async () => {
  return (
    <div className="lg:grid lg:h-full lg:w-full lg:grid-cols-1 xl:h-full xl:w-full xl:grid-cols-1 space-y-4 p-4">
      <div className="w-full flex flex-col items-center justify-center">
        <TabsConfig />
      </div>
    </div>
  );
};

export default DepartamentsPage;
