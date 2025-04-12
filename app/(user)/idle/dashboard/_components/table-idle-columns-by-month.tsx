"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IdleByMonthDataDto } from "@/app/_data-access/idle/monitoring/get-idle-by-month";

type CellFormatterFunction = (value: number) => React.ReactNode;

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

const createMonthColumn = (
  monthIndex: number
): ColumnDef<IdleByMonthDataDto, unknown> => ({
  accessorKey: `month_${monthIndex}`,
  header: ({ table }) => (
    <strong>
      {table.getRowModel().rows[0]?.original.month_numbers?.[monthIndex - 1] ||
        `Month ${monthIndex}`}
    </strong>
  ),
  cell: ({ row }) =>
    formatCellValue(row.original.title, row.getValue(`month_${monthIndex}`)),
});

export const idleTableColumnsByMonth: ColumnDef<IdleByMonthDataDto, unknown>[] =
  [
    createMonthColumn(1),
    createMonthColumn(2),
    createMonthColumn(3),
    createMonthColumn(4),
    createMonthColumn(5),
    createMonthColumn(6),
  ];

const formatCellValue = (title: string, value: number): React.ReactNode => {
  const formatter = CELL_FORMATTERS[title];
  return formatter ? formatter(value) : String(value);
};
