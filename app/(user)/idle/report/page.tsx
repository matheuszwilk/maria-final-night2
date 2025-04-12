import Header, {
  HeaderLeft,
  HeaderRight,
  HeaderSubtitle,
  HeaderTitle,
} from "@/components/header-body";
import SelectMonthAndLine from "@/app/(user)/idle/report/_components/filter-month-and-line";
import { getDefectAccData } from "@/app/_data-access/idle/report/get-defect-acc-by-time";
import { DefectAccDataDto } from "@/app/_data-access/idle/report/get-defect-acc-by-time";
import ChartDefect from "@/app/(user)/idle/report/_components/chart-defect-time";
import ChartDefectByQty from "@/app/(user)/idle/report/_components/chart-defect-qty";
import { getDefectQtyAccData } from "@/app/_data-access/idle/report/get-defect-acc-by-qty";
import { DefectQtyAccDataDto } from "@/app/_data-access/idle/report/get-defect-acc-by-qty";
import { defectReportColumns } from "@/app/(user)/idle/report/_components/table-report-columns";
import {
  getIdleReportData,
  IdleReportDataDto,
} from "@/app/_data-access/idle/report/get-report-data";
import {
  Card,
  CardDescription,
  CardTitle,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { FileTextIcon } from "lucide-react";
import { CustomDataTable } from "@/components/custon-table";

export const dynamic = "force-dynamic";

interface SearchParams {
  month?: string;
  org?: string;
  line?: string;
}

interface ReportData {
  defectAccData: DefectAccDataDto[];
  defectQtyAccData: DefectQtyAccDataDto[];
  idleReportData: IdleReportDataDto[];
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
): Promise<ReportData> => {
  const [defectAccData, defectQtyAccData, idleReportData] = await Promise.all([
    getDefectAccData(targetMonth, targetOrg, targetLine),
    getDefectQtyAccData(targetMonth, targetOrg, targetLine),
    getIdleReportData(targetMonth, targetOrg, targetLine),
  ]);

  return {
    defectAccData,
    defectQtyAccData,
    idleReportData,
  };
};

const AndonPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const targetMonth = searchParams.month || getFormattedDate();
  const targetOrg = searchParams.org || "All";
  const targetLine = searchParams.line || "All";

  const { defectAccData, defectQtyAccData, idleReportData } =
    await fetchReportData(targetMonth, targetOrg, targetLine);

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4">
      <Header>
        <HeaderLeft>
          <HeaderSubtitle>Idle Report</HeaderSubtitle>
          <HeaderTitle>Action Plan Status & Progress Tracking</HeaderTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <ChartDefect data={defectAccData} />
        <ChartDefectByQty data={defectQtyAccData} />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Status and Action Plan</CardTitle>
          <CardDescription>
            Departmental Status Overview and Action Planning
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="w-full overflow-x-auto">
            <CustomDataTable
              columns={defectReportColumns}
              data={idleReportData}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col sm:flex-row items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                Department-wise Status and Action Plans{" "}
                <FileTextIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Tracking departmental responses and improvement initiatives
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AndonPage;
