import { DataTable } from "@/components/ui/data-table";
import {
  AndonByWeekDataDto,
  getAndonData,
} from "@/app/_data-access/andon/monitoring/get-andon-by-week";
import SelectMonthAndLine from "./_components/filter-month-and-line";
import {
  AndonByMonthDataDto,
  getAndonByMonthData,
} from "@/app/_data-access/andon/monitoring/get-andon-by-month";
import { andonTableColumnsByMonth } from "./_components/table-andon-columns-by-month";
import {
  AndonByYearDataDto,
  getAndonByYearData,
} from "@/app/_data-access/andon/monitoring/get-andon-by-year";
import { andonTableColumnsByYear } from "./_components/table-andon-columns-by-year";
import ChartMonth from "./_components/chart-month";
import ChartWeek from "./_components/chart-week";
import ChartYear from "./_components/chart-year";
import { andonTableColumns } from "./_components/table-andon-columns-by-week";
import Header, {
  HeaderLeft,
  HeaderRight,
  HeaderSubtitle,
  HeaderTitle,
} from "@/components/header-body";
import { DataCard } from "@/components/data-card";
import {
  AndonByYearMonthDataDto,
  getAndonByYearMonthData,
} from "@/app/_data-access/andon/monitoring/card-andon-my-year-month";

export const dynamic = "force-dynamic";

interface SearchParams {
  month?: string;
  org?: string;
  line?: string;
}

interface AndonDataResponse {
  andonData: AndonByWeekDataDto[];
  andonByMonthData: AndonByMonthDataDto[];
  andonByYearData: AndonByYearDataDto[];
  andonByYearMonthData: AndonByYearMonthDataDto[];
}

const getCurrentMonth = () => {
  const currentDate = new Date();
  const previousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
};

const fetchAndonData = async (
  targetMonth: string,
  targetOrg: string,
  targetLine: string
): Promise<AndonDataResponse> => {
  const [andonData, andonByMonthData, andonByYearData, andonByYearMonthData] =
    await Promise.all([
      getAndonData(targetMonth, targetOrg, targetLine),
      getAndonByMonthData(targetMonth, targetOrg, targetLine),
      getAndonByYearData(targetMonth, targetOrg, targetLine),
      getAndonByYearMonthData(targetMonth, targetOrg, targetLine),
    ]);

  return {
    andonData,
    andonByMonthData,
    andonByYearData,
    andonByYearMonthData,
  };
};

interface ChartSectionProps<T> {
  title?: string;
  chart: React.ReactNode;
  data: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
}

const ChartSection = <T,>({
  title,
  chart,
  data,
  columns,
}: ChartSectionProps<T>) => (
  <div className="flex w-full flex-col gap-2 space-y-2">
    {title && <h3 className="text-lg font-semibold">{title}</h3>}
    {chart}
    <div className="overflow-auto">
      <DataTable columns={columns} data={data} />
    </div>
  </div>
);

const AndonPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const targetMonth = searchParams.month || getCurrentMonth();
  const targetOrg = searchParams.org || "All";
  const targetLine = searchParams.line || "All";

  const { andonData, andonByMonthData, andonByYearData, andonByYearMonthData } =
    await fetchAndonData(targetMonth, targetOrg, targetLine);

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4">
      <Header>
        <HeaderLeft>
          <HeaderSubtitle>Andon</HeaderSubtitle>
          <HeaderTitle>Andon Time Monitoring & Analysis Dashboard</HeaderTitle>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          title="Working Time"
          dateRange="Working Time Comparison"
          value={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Working Time"
            )?.current_year || 0
          }
          percentageChange={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Working Time"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={0}
        />
        <DataCard
          title="Andon"
          dateRange="Andon Comparison"
          value={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Andon"
            )?.current_year || 0
          }
          percentageChange={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Andon"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={0}
        />
        <DataCard
          title="Andon Stop Qty"
          dateRange="Andon Stop Comparison"
          value={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Andon Stop Qty"
            )?.current_year || 0
          }
          percentageChange={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Andon Stop Qty"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={0}
        />
        <DataCard
          title="Instant Stop Rate"
          dateRange="Instant Stop Rate Comparison"
          value={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Instant Stop Rate"
            )?.current_year || 0
          }
          percentageChange={
            andonByYearMonthData.find(
              (d: AndonByYearMonthDataDto) => d.title === "Instant Stop Rate"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={2}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartSection<AndonByYearDataDto>
          chart={<ChartYear data={andonByYearData} />}
          data={andonByYearData}
          columns={andonTableColumnsByYear}
        />
        <ChartSection<AndonByMonthDataDto>
          chart={<ChartMonth data={andonByMonthData} />}
          data={andonByMonthData}
          columns={andonTableColumnsByMonth}
        />
        <ChartSection<AndonByWeekDataDto>
          chart={<ChartWeek data={andonData} />}
          data={andonData}
          columns={andonTableColumns}
        />
      </div>
    </div>
  );
};

export default AndonPage;
