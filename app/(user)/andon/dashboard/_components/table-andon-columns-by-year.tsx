"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AndonByYearDataDto } from "@/app/_data-access/andon/monitoring/get-andon-by-year";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CellFormatterFunction = (value: number) => React.ReactNode;

const CELL_FORMATTERS: Record<string, CellFormatterFunction> = {
  "Working Time": (value) => `${Number(value).toFixed(0)}`,
  Andon: (value) => `${Number(value).toFixed(0)}`,
  "Andon Stop Qty": (value) => String(value),
  Target: (value) => (
    <Badge variant="outline">{`${(Number(value) * 100).toFixed(2)}%`}</Badge>
  ),
  "Instant Stop Rate": (value) => (
    <Badge variant="outline">{`${(Number(value) * 100).toFixed(2)}%`}</Badge>
  ),
  "Achievement Rate": (value) => {
    const formattedValue = `${(Number(value) * 100).toFixed(0)}%`;
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
): ColumnDef<AndonByYearDataDto, unknown> => ({
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

export const andonTableColumnsByYear: ColumnDef<AndonByYearDataDto, unknown>[] =
  [
    {
      accessorKey: "title",
      header: "",
    },
    createYearColumn(1),
    createYearColumn(2),
  ];

const formatCellValue = (title: string, value: number): React.ReactNode => {
  const formatter = CELL_FORMATTERS[title];
  return formatter ? formatter(value) : String(value);
};
