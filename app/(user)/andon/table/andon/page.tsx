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
import { manAndonReportColumns } from "./_components/table-report-columns";
import { CustomDataTable } from "@/components/custon-table";
import SelectMonthAndLine from "./_components/filter-month-and-line";
import {
  getManAndonByMonthData,
  ManAndonByMonthDataDto,
} from "@/app/_data-access/andon/table/get-man-andon-data-month";

interface SearchParams {
  month?: string;
  org?: string;
  line?: string;
}

interface AndonData {
  andonData: ManAndonByMonthDataDto[];
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
): Promise<AndonData> => {
  const andonData = await getManAndonByMonthData(
    targetMonth,
    targetOrg,
    targetLine
  );

  return { andonData };
};

export default async function ManHour({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const targetLine = searchParams.line || "All";
  const targetMonth = searchParams.month || getFormattedDate();
  const targetOrg = searchParams.org || "All";
  const { andonData } = await fetchReportData(
    targetMonth,
    targetOrg,
    targetLine
  );

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4">
      <Header>
        <HeaderLeft>
          <HeaderSubtitle>Andon Raw Data</HeaderSubtitle>
          <HeaderTitle>Production Line Stop Data from Andon System</HeaderTitle>
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
          <CardTitle>Andon Stop Data</CardTitle>
          <CardDescription>
            Raw data visualization of production line stops from Andon system
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="w-full">
            <CustomDataTable columns={manAndonReportColumns} data={andonData} />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col sm:flex-row items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Historical Andon Stop Data <FileTextIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Complete record of production line stops registered in the Andon
                system
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
