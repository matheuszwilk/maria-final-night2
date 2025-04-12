"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IdleByWeekDataDto } from "@/app/_data-access/idle/monitoring/get-idle-by-week";

type CellFormatterFunction = (value: number | null) => React.ReactNode;

const CELL_FORMATTERS: Record<string, CellFormatterFunction> = {
  "Direct Man Hour": (value) => (value ? Number(value).toFixed(0) : "0"),
  "Idle Man Hour": (value) => (value ? Number(value).toFixed(0) : "0"),
  "Target (%)": (value) => (
    <Badge variant="outline">{`${value ? Number(value).toFixed(2) : "0"}%`}</Badge>
  ),
  "Idle Rate (%)": (value) => (
    <Badge variant="outline">{`${value ? Number(value).toFixed(2) : "0"}%`}</Badge>
  ),
  "Achievement Rate (%)": (value) => {
    if (!value) return "0%";
    const absValue = Math.abs(value);
    const formattedValue = `${absValue.toFixed(0)}%`;
    const Icon = value >= 0 ? ArrowDownCircle : ArrowUpCircle;
    const colorClass = value >= 0 ? "text-green-500" : "text-red-500";

    return (
      <div className="flex items-center justify-center">
        {formattedValue}
        <Icon className={`ml-1 ${colorClass}`} size={16} />
      </div>
    );
  },
};

const createWeekColumn = (
  weekIndex: number
): ColumnDef<IdleByWeekDataDto, unknown> => ({
  accessorKey: `week_${weekIndex}`,
  header: ({ table }) => (
    <strong>
      W
      {table.getRowModel().rows[0]?.original.week_numbers?.[weekIndex - 1] ||
        weekIndex}
    </strong>
  ),
  cell: ({ row }) =>
    formatCellValue(row.original.title, row.getValue(`week_${weekIndex}`)),
});

export const idleTableColumnsByWeek: ColumnDef<IdleByWeekDataDto, unknown>[] = [
  createWeekColumn(1),
  createWeekColumn(2),
  createWeekColumn(3),
  createWeekColumn(4),
  createWeekColumn(5),
];

const formatCellValue = (
  title: string,
  value: number | null
): React.ReactNode => {
  const formatter = CELL_FORMATTERS[title];
  return formatter ? formatter(value) : value?.toString() || "0";
};
