import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomDataTable } from "@/components/custon-table";
import { getAllEmailsToTable } from "@/app/_data-access/email/get-all-email";
import { emailColumns } from "../email/_components/table-columns";
import CreateEmailButton from "../email/_components/create-product-button";
import { getAllTargetstoTable } from "@/app/_data-access/target/get-all-target";
import { targetColumns } from "../target/table-columns";
import CreateTargetButton from "../target/create-target-button";

export async function TabsConfig() {
  const emails = await getAllEmailsToTable();
  const targets = await getAllTargetstoTable();

  return (
    <Tabs defaultValue="email" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="target">Target</TabsTrigger>
      </TabsList>
      <TabsContent value="email">
        <div className="flex justify-end mt-4 dark:border-[#27272A] border border-gray-200 rounded-md p-4">
          <CreateEmailButton />
        </div>
        <CustomDataTable columns={emailColumns} data={emails} />
      </TabsContent>
      <TabsContent value="target">
        <div className="flex justify-end mt-4 dark:border-[#27272A] border border-gray-200 rounded-md p-4">
          <CreateTargetButton />
        </div>
        <CustomDataTable columns={targetColumns} data={targets} />
      </TabsContent>
    </Tabs>
  );
}
