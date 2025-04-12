"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { IdleReportDataDto } from "@/app/_data-access/idle/report/get-report-data";
import { FileTextIcon } from "lucide-react";
import DefectReportTableDropdownMenu from "./table-dropdown-menu-report";

export const defectReportColumns: ColumnDef<IdleReportDataDto>[] = [
  {
    accessorKey: "idle_rework_code_4",
    header: "Code",
  },
  {
    accessorKey: "organization",
    header: "Organization",
  },
  {
    accessorKey: "line",
    header: "Line",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "contents",
    header: "Contents",
    // cell: ({ row }) => {
    //   return (
    //     <div className="whitespace-nowrap">{row.getValue("contents")}</div>
    //   );
    // },
  },
  {
    accessorKey: "secondary_cause_dept",
    header: "Department",
  },
  {
    accessorKey: "idle_time",
    header: "Time (min)",
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
        defectReport={row.original as IdleReportDataDto}
      />
    ),
  },
];
