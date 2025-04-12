"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IdleByYearDataDto } from "@/app/_data-access/idle/monitoring/get-idle-by-year";

type CellFormatterFunction = (value: number) => React.ReactNode;

const CELL_FORMATTERS: Record<string, CellFormatterFunction> = {
  "Direct Man Hour": (value) => value.toFixed(0),
  "Idle Man Hour": (value) => value.toFixed(0),
  "Target (%)": (value) => (
    <Badge variant="outline">{`${value.toFixed(2)}%`}</Badge>
  ),
  "Idle Rate (%)": (value) => (
    <Badge variant="outline">{`${value.toFixed(2)}%`}</Badge>
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

const createYearColumn = (
  yearIndex: number
): ColumnDef<IdleByYearDataDto, unknown> => ({
  accessorKey: `year_${yearIndex}`,
  header: ({ table }) => (
    <strong>
      {table.getRowModel().rows[0]?.original.year_numbers?.[yearIndex - 1] ||
        `Year ${yearIndex}`}
    </strong>
  ),
  cell: ({ row }) =>
    formatCellValue(row.original.title, row.getValue(`year_${yearIndex}`)),
});

export const idleTableColumnsByYear: ColumnDef<IdleByYearDataDto, unknown>[] = [
  {
    accessorKey: "title",
    header: "",
    cell: ({ row }) => <div className="text-left">{row.getValue("title")}</div>,
  },
  createYearColumn(1),
  createYearColumn(2),
];

const formatCellValue = (title: string, value: number): React.ReactNode => {
  const formatter = CELL_FORMATTERS[title];
  return formatter ? formatter(value) : String(value);
};
