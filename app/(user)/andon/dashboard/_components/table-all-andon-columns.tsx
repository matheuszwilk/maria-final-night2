"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AndonAllDataDto } from "@/app/_data-access/andon/get-all-andon";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";

type CellFormatterFunction = (value: number) => React.ReactNode;

const CELL_FORMATTERS: Record<string, CellFormatterFunction> = {
  "Man Hour": (value) => `${Number(value).toFixed(0)}`,
  Andon: (value) => `${Number(value).toFixed(0)}`,
  "Andon Stop Qty": (value) => String(value),
  Target: (value) => (
    <Badge variant="outline">{`${(Number(value) * 100).toFixed(2)}%`}</Badge>
  ),
  "Instant Stop Rate": (value) => (
    <Badge variant="outline">{`${(Number(value) * 100).toFixed(2)}%`}</Badge>
  ),
  "Achievement Rate": (value) => {
    const formattedValue = `${(Number(value) * 100).toFixed(2)}%`;
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

const createWeekColumn = (weekNumber: string): ColumnDef<AndonAllDataDto> => ({
  accessorKey: `weeks.${weekNumber}`,
  header: () => <strong>W{weekNumber}</strong>,
  cell: ({ row }) =>
    formatCellValue(row.original.title, row.original.weeks[weekNumber] || 0),
});

export const andonAllTableColumns: ColumnDef<AndonAllDataDto>[] = [
  {
    accessorKey: "title",
    header: "",
    cell: ({ row }) => <strong>{row.original.title}</strong>,
  },
  ...Array.from({ length: 53 }, (_, i) => {
    const weekNumber = (i + 1).toString().padStart(2, "0");
    return createWeekColumn(weekNumber);
  }),
];

const formatCellValue = (title: string, value: number): React.ReactNode => {
  const formatter = CELL_FORMATTERS[title];
  return formatter ? formatter(value) : String(value);
};
