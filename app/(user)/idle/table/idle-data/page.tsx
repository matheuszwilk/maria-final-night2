import Header, {
  HeaderLeft,
  HeaderSubtitle,
  HeaderTitle,
  HeaderRight,
} from "@/components/header-body";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FileTextIcon } from "lucide-react";
import {
  getIdleRawDataMonth,
  IdleRawDataDto,
} from "@/app/_data-access/idle/table/get-idle-raw-data-month";
import { idleReportColumns } from "./_components/table-report-columns";
import { CustomDataTable } from "@/components/custon-table";
import SelectMonthAndLine from "./_components/filter-month-and-line";

interface SearchParams {
  month?: string;
  org?: string;
  line?: string;
}

interface IdleData {
  idleData: IdleRawDataDto[];
}

const getFormattedDate = () => {
  const currentDate = new Date();
  const previousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
};

const fetchReportData = async (
  targetMonth: string,
  targetOrg: string,
  targetLine: string
): Promise<IdleData> => {
  const idleData = await getIdleRawDataMonth(
    targetMonth,
    targetOrg,
    targetLine
  );

  return { idleData };
};

export default async function IdleData({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const targetLine = searchParams.line || "All";
  const targetOrg = searchParams.org || "All";
  const targetMonth = searchParams.month || getFormattedDate();
  const { idleData } = await fetchReportData(
    targetMonth,
    targetOrg,
    targetLine
  );

  console.log("Idle Data from Database:", idleData);

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4">
      <Header>
        <HeaderLeft>
          <HeaderSubtitle>Idle Raw Data</HeaderSubtitle>
          <HeaderTitle>Idle Data from Production System</HeaderTitle>
        </HeaderLeft>
        <HeaderRight>
          <div className="flex flex-wrap gap-4">
            <SelectMonthAndLine
              initialMonth={targetMonth}
              initialOrg={targetOrg}
              initialLine={targetLine}
            />
          </div>
        </HeaderRight>
      </Header>
      <Card className="w-full bg-background">
        <CardHeader>
          <CardTitle>Idle Data</CardTitle>
          <CardDescription>
            Raw data visualization of idle time from production system
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="w-full">
            <CustomDataTable columns={idleReportColumns} data={idleData} />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col sm:flex-row items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Historical Idle Data <FileTextIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Complete record of idle time registered in the production system
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
