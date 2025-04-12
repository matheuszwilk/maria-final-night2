"use client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, ClipboardCopyIcon, EditIcon } from "lucide-react";
import { useState } from "react";
import UpsertReportDialogContent from "./upsert-dialog-content-report";
import { IdleReportDataDto } from "@/app/_data-access/idle/report/get-report-data";
import { useToast } from "@/hooks/use-toast";

interface DefectReportTableDropdownMenuProps {
  defectReport: IdleReportDataDto;
}

const DefectReportTableDropdownMenu = ({
  defectReport,
}: DefectReportTableDropdownMenuProps) => {
  const [editDialogOpen, setEditDialogIsOpen] = useState(false);
  const { toast } = useToast();

  return (
    <AlertDialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <MoreHorizontalIcon size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-sm font-medium text-center">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-1.5"
              onClick={() => {
                const textToCopy = defectReport.secondary_cause_dept ?? "";
                navigator.clipboard.writeText(textToCopy).then(() => {
                  toast({
                    description:
                      "Departamento copiado para a área de transferência ✓",
                  });
                });
              }}
            >
              <ClipboardCopyIcon size={16} />
              Copy Department
            </DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem className="gap-1.5">
                <EditIcon size={16} />
                Input Action Plan
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <UpsertReportDialogContent
          defaultValues={{
            id: defectReport.id,
            year_month: defectReport.year_month,
            date: defectReport.date ? new Date(defectReport.date) : null,
            idle_rework_code_4: defectReport.idle_rework_code_4,
            organization: defectReport.organization,
            line: defectReport.line,
            model: defectReport.model,
            contents: defectReport.contents,
            end_date: defectReport.end_date
              ? new Date(defectReport.end_date)
              : null,
            secondary_cause_dept: defectReport.secondary_cause_dept,
            idle_time: defectReport.idle_time,
            createdAt: defectReport.createdAt
              ? new Date(defectReport.createdAt)
              : null,
            status: defectReport.status,
            action_plan_file_url: defectReport.action_plan_file_url,
          }}
          setDialogIsOpen={setEditDialogIsOpen}
        />
      </Dialog>
    </AlertDialog>
  );
};

export default DefectReportTableDropdownMenu;
