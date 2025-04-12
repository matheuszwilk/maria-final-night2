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
import { AndonReportDataDto } from "@/app/_data-access/andon/report/get-report-data";
import UpsertReportDialogContent from "@/app/(user)/andon/report/_components/upsert-dialog-content-report";
import { useToast } from "@/hooks/use-toast";

interface DefectReportTableDropdownMenuProps {
  defectReport: AndonReportDataDto;
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
                const textToCopy = defectReport.cause_department;
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
            andon_process: defectReport.andon_process,
            equipment_line: defectReport.equipment_line,
            reason: defectReport.reason,
            end_date: defectReport.end_date.toISOString(),
            cause_department: defectReport.cause_department,
            andon_time: defectReport.andon_time,
            createdAt: defectReport.createdAt,
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
