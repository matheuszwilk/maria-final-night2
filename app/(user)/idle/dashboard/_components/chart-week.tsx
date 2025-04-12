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

interface WeekData {
  title: string;
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
  week_5: number;
  week_numbers: string[];
}

interface ChartData {
  week: string;
  Target: number;
  "Idle Rate (%)": number;
}

interface ChartWeekProps {
  data: WeekData[];
}

const ChartWeek: React.FC<ChartWeekProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getThemeColors = () => ({
    text: isDark ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
    grid: isDark ? "hsl(var(--border))" : "hsl(var(--border))",
    background: isDark ? "hsl(var(--background))" : "white",
    stroke: isDark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
  });

  const chartData: ChartData[] = data[0].week_numbers.map((week, index) => {
    const weekKey = `week_${index + 1}` as keyof WeekData;
    return {
      week,
      Target: Number(data[2][weekKey]),
      "Idle Rate (%)": Number(data[3][weekKey]),
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
        <CardDescription>Weekly Performance Overview</CardDescription>
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
                dataKey="week"
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
              Monitoring idle rates across weeks
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChartWeek;
