"use client";

import React from "react";
import {
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

interface MonthData {
  title: string;
  month_1: number;
  month_2: number;
  month_3: number;
  month_4: number;
  month_5: number;
  month_6: number;
  month_numbers: string[];
}

interface ChartData {
  month: string;
  Target: number;
  "Idle Rate (%)": number;
}

interface ChartMonthProps {
  data: MonthData[];
}

const ChartMonth: React.FC<ChartMonthProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getThemeColors = () => ({
    text: isDark ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
    grid: isDark ? "hsl(var(--border))" : "hsl(var(--border))",
    background: isDark ? "hsl(var(--background))" : "white",
    stroke: isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
  });

  const chartData: ChartData[] = data[0].month_numbers.map((month, index) => {
    const monthKey = `month_${index + 1}` as keyof MonthData;
    return {
      month,
      Target: Number(data[2][monthKey]),
      "Idle Rate (%)": Number(data[3][monthKey]),
    };
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
          const value = `${(entry.value as number).toFixed(2)}%`;
          return (
            <p key={index} className="text-sm">
              {entry.name}: {value}
            </p>
          );
        })}
      </div>
    );
  };

  const colors = getThemeColors();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Monthly Performance Overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
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
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: colors.text, fontSize: 12 }}
              />,
              <YAxis
                key="yAxis"
                stroke={colors.text}
                tick={{ fill: colors.text, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />,
              <Tooltip key="tooltip" content={<CustomTooltip />} />,
              <Line
                key="line1"
                type="monotone"
                dataKey="Target"
                stroke="rgb(34, 197, 94)"
                strokeWidth={2}
                dot={{ fill: colors.background }}
                activeDot={{ r: 6 }}
                name="Target"
              />,
              <Line
                key="line2"
                type="monotone"
                dataKey="Idle Rate (%)"
                stroke={colors.stroke}
                strokeWidth={2}
                dot={{ fill: colors.background }}
                activeDot={{ r: 6 }}
                name="Idle Rate (%)"
              />
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Performance Trends <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Monitoring idle rates across months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChartMonth;
