"use client";

import React from "react";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import { useTheme } from "next-themes";
import { DefectQtyAccDataDto } from "@/app/_data-access/idle/report/get-defect-acc-by-qty";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentType } from "react";

interface ChartDefectProps {
  data: DefectQtyAccDataDto[];
}

interface FormattedChartData {
  month: string;
  line: string;
  secondary_cause_dept: string;
  idle_count: number;
  idle_porcent: number;
  idle_procent_acc: number;
}

const ChartDefectByQty: React.FC<ChartDefectProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatData = (rawData: DefectQtyAccDataDto[]): FormattedChartData[] => {
    return rawData.map((item) => ({
      month: item.month,
      line: item.line,
      secondary_cause_dept: item.secondary_cause_dept,
      idle_count: Number(item.idle_count),
      idle_porcent: parseFloat(item.idle_porcent),
      idle_procent_acc: parseFloat(item.idle_procent_acc),
    }));
  };

  const getThemeColors = () => ({
    text: isDark ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
    grid: isDark ? "hsl(var(--border))" : "hsl(var(--border))",
    background: isDark ? "hsl(var(--background))" : "white",
    stroke: isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
  });

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        {payload.map((entry, index) => {
          const value =
            entry.name === "idle_procent_acc"
              ? `${entry.value?.toFixed(2)}%`
              : entry.value?.toLocaleString();
          const name =
            entry.name === "idle_count" ? "Total Qty" : "Idle Index %";

          return (
            <p key={index} className="text-sm">
              {name}: {value}
            </p>
          );
        })}
      </div>
    );
  };

  const chartData = formatData(data);
  const colors = getThemeColors();

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-none">
        <CardTitle>Idle Analysis</CardTitle>
        <CardDescription>Quantity and Percentage Analysis</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
        <div className="w-full h-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {React.createElement(
              ComposedChart as ComponentType<any>,
              {
                data: chartData,
                margin: { top: 20, right: 30, left: 20, bottom: 20 },
              },
              <CartesianGrid
                key="grid"
                strokeDasharray="3 3"
                stroke={colors.grid}
                vertical={false}
              />,
              <XAxis
                key="xAxis"
                dataKey="secondary_cause_dept"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: colors.text, fontSize: 12 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />,
              <YAxis
                key="yAxisLeft"
                yAxisId="left"
                stroke={colors.text}
                tick={{ fill: colors.text, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />,
              <YAxis
                key="yAxisRight"
                yAxisId="right"
                orientation="right"
                stroke={colors.text}
                tick={{ fill: colors.text, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />,
              <Tooltip key="tooltip" content={<CustomTooltip />} />,
              <Bar
                key="bar"
                yAxisId="left"
                dataKey="idle_count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={40}
                name="idle_count"
              />,
              <Line
                key="line"
                yAxisId="right"
                type="monotone"
                dataKey="idle_procent_acc"
                stroke={colors.stroke}
                strokeWidth={2}
                dot={{ fill: colors.background }}
                activeDot={{ r: 6 }}
                name="idle_procent_acc"
                label={{
                  position: "top",
                  fill: colors.stroke,
                  fontSize: 12,
                  formatter: (value: number) => `${value.toFixed(2)}%`,
                }}
              />
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-none">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Analysis of idle by quantity <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total idle and accumulated percentage
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChartDefectByQty;
