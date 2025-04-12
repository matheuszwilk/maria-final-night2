"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AndonReportDataDto } from "@/app/_data-access/andon/report/get-report-data";
import { FileTextIcon } from "lucide-react";
import DefectReportTableDropdownMenu from "@/app/(user)/andon/report/_components/table-dropdown-menu-report";

export const defectReportColumns: ColumnDef<AndonReportDataDto>[] = [
  {
    accessorKey: "andon_process",
    header: "Process",
  },
  {
    accessorKey: "organization",
    header: "Organization",
  },
  {
    accessorKey: "equipment_line",
    header: "Line",
  },
  {
    accessorKey: "reason",
    header: "Reason",
    // cell: ({ row }) => {
    //   return <div className="whitespace-nowrap">{row.getValue("reason")}</div>;
    // },
  },
  {
    accessorKey: "end_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("end_date"));
      // Use Korean locale and format YYYY-MM-DD
      return date
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, "-")
        .replace(".", "");
    },
  },
  {
    accessorKey: "cause_department",
    header: "Department",
  },
  {
    accessorKey: "andon_time",
    header: "Time (sec)",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const displayStatus = status === "OK" ? "Done" : "Waiting";
      return (
        <Badge variant={status === "OK" ? "default" : "secondary"}>
          {displayStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action_plan_file_url",
    header: "Action Plan",
    cell: ({ row }) => {
      const url = row.getValue("action_plan_file_url") as string;
      return url ? (
        <div className="flex justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            <FileTextIcon className="h-5 w-5" />
          </a>
        </div>
      ) : null;
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => (
      <DefectReportTableDropdownMenu
        defectReport={row.original as AndonReportDataDto}
      />
    ),
  },
];
