import { DataTable } from "@/components/ui/data-table";
import {
  IdleByWeekDataDto,
  getIdleByWeekData,
} from "@/app/_data-access/idle/monitoring/get-idle-by-week";
import SelectMonthAndLine from "./_components/filter-month-and-line";
import { idleTableColumnsByYear } from "./_components/table-idle-columns-by-year";
import ChartMonth from "./_components/chart-month";
import ChartWeek from "./_components/chart-week";
import ChartYear from "./_components/chart-year";
import { idleTableColumnsByWeek } from "./_components/table-idle-columns-by-week";
import Header, {
  HeaderLeft,
  HeaderRight,
  HeaderSubtitle,
  HeaderTitle,
} from "@/components/header-body";
import { DataCard } from "@/components/data-card";

import {
  IdleByYearDataDto,
  getIdleByYearData,
} from "@/app/_data-access/idle/monitoring/get-idle-by-year";
import {
  IdleByMonthDataDto,
  getIdleByMonthData,
} from "@/app/_data-access/idle/monitoring/get-idle-by-month";
import { idleTableColumnsByMonth } from "./_components/table-idle-columns-by-month";
import {
  IdleByYearMonthDataDto,
  getIdleByYearMonthData,
} from "@/app/_data-access/idle/monitoring/card-idle-my-year-month";
export const dynamic = "force-dynamic";

interface SearchParams {
  month?: string;
  org?: string;
  line?: string;
}

interface IdleDataResponse {
  idleByYearMonthData: IdleByYearMonthDataDto[];
  idleByYearData: IdleByYearDataDto[];
  idleByMonthData: IdleByMonthDataDto[];
  idleData: IdleByWeekDataDto[];
}

const getCurrentMonth = () => {
  const currentDate = new Date();
  const previousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1
  );
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
};

const fetchIdleData = async (
  targetMonth: string,
  targetOrg: string,
  targetLine: string
): Promise<IdleDataResponse> => {
  const [idleData, idleByMonthData, idleByYearData, idleByYearMonthData] =
    await Promise.all([
      getIdleByWeekData(targetMonth, targetOrg, targetLine),
      getIdleByMonthData(targetMonth, targetOrg, targetLine),
      getIdleByYearData(targetMonth, targetOrg, targetLine),
      getIdleByYearMonthData(targetMonth, targetOrg, targetLine),
    ]);

  return {
    idleData,
    idleByMonthData,
    idleByYearData,
    idleByYearMonthData,
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
  const { idleData, idleByMonthData, idleByYearData, idleByYearMonthData } =
    await fetchIdleData(targetMonth, targetOrg, targetLine);

  console.log(idleByYearMonthData);

  return (
    <div className="w-full space-y-4 rounded-lg bg-background p-4">
      <Header>
        <HeaderLeft>
          <HeaderSubtitle>Idle</HeaderSubtitle>
          <HeaderTitle>Idle Time Monitoring & Analysis Dashboard</HeaderTitle>
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
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Total Working Time"
            )?.current_year || 0
          }
          percentageChange={
            -(
              idleByYearMonthData.find(
                (d: IdleByYearMonthDataDto) => d.title === "Total Working Time"
              )?.yoy_change || 0
            )
          }
          variant="success"
          decimals={0}
        />
        <DataCard
          title="Direct Hours"
          dateRange="Direct Hours Comparison"
          value={
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Direct Hours"
            )?.current_year || 0
          }
          percentageChange={
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Direct Hours"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={0}
        />
        <DataCard
          title="Idle Hours (Minutes)"
          dateRange="Idle Hours Comparison"
          value={
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Idle Hours"
            )?.current_year || 0
          }
          percentageChange={
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Idle Hours"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={0}
        />
        <DataCard
          title="Idle Rate (%)"
          dateRange="Idle Rate Comparison"
          value={
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Idle Rate"
            )?.current_year || 0
          }
          percentageChange={
            idleByYearMonthData.find(
              (d: IdleByYearMonthDataDto) => d.title === "Idle Rate"
            )?.yoy_change || 0
          }
          variant="success"
          decimals={2}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartSection<IdleByYearDataDto>
          chart={<ChartYear data={idleByYearData} />}
          data={idleByYearData}
          columns={idleTableColumnsByYear}
        />
        <ChartSection<IdleByMonthDataDto>
          chart={<ChartMonth data={idleByMonthData} />}
          data={idleByMonthData}
          columns={idleTableColumnsByMonth}
        />
        <ChartSection<IdleByWeekDataDto>
          chart={<ChartWeek data={idleData} />}
          data={idleData}
          columns={idleTableColumnsByWeek}
        />
      </div>
    </div>
  );
};

export default AndonPage;
