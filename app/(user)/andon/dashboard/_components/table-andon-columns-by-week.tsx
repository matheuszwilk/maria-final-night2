"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AndonByWeekDataDto } from "@/app/_data-access/andon/monitoring/get-andon-by-week";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WeekColumnConfig = {
  weekNumber: number;
  accessorKey: string;
};

const WEEK_COLUMNS: WeekColumnConfig[] = [
  { weekNumber: 2, accessorKey: "week_2" },
  { weekNumber: 3, accessorKey: "week_3" },
  { weekNumber: 4, accessorKey: "week_4" },
  { weekNumber: 5, accessorKey: "week_5" },
];

const createWeekColumn = ({
  weekNumber,
  accessorKey,
}: WeekColumnConfig): ColumnDef<AndonByWeekDataDto> => ({
  accessorKey,
  header: ({ table }) => (
    <strong>
      W
      {table.getRowModel().rows[0]?.original.week_numbers[weekNumber - 1] ||
        weekNumber}
    </strong>
  ),
  cell: ({ row }) =>
    formatCellValue(row.original.title, row.getValue(accessorKey)),
});

export const andonTableColumns: ColumnDef<AndonByWeekDataDto>[] =
  WEEK_COLUMNS.map(createWeekColumn);

const VALUE_FORMATTERS = {
  "Man Hour": (value: number) => Number(value).toFixed(0),
  Andon: (value: number) => Number(value).toFixed(0),
  "Andon Stop Qty": String,
  Target: (value: number) => (
    <Badge variant="outline">{`${(value * 100).toFixed(2)}%`}</Badge>
  ),
  "Instant Stop Rate": (value: number) => (
    <Badge variant="outline">{`${(value * 100).toFixed(2)}%`}</Badge>
  ),
  "Achievement Rate": (value: number) => {
    const formattedValue = `${(value * 100).toFixed(0)}%`;
    return (
      <div className="flex items-center justify-center">
        {formattedValue}
        {value >= 0 ? (
          <ArrowDownCircle className="ml-1 text-green-500" size={16} />
        ) : (
          <ArrowUpCircle className="ml-1 text-red-500" size={16} />
        )}
      </div>
    );
  },
};

const formatCellValue = (title: string, value: number): React.ReactNode => {
  const formatter = VALUE_FORMATTERS[title as keyof typeof VALUE_FORMATTERS];
  return formatter ? formatter(value) : String(value);
};
