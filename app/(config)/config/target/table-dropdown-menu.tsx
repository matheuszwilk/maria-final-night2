import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, ClipboardCopyIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DeleteTargetDialogContent from "./delete-dialog-content";
import { TargetDataDto } from "@/app/_data-access/target/get-all-target";

interface TargetTableDropdownMenuProps {
  target: TargetDataDto;
}

const TargetTableDropdownMenu = ({ target }: TargetTableDropdownMenuProps) => {
  const [editDialogOpen, setEditDialogIsOpen] = useState(false);
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
                navigator.clipboard.writeText(target.projectName);
                toast.success(
                  `Target "${target.projectName}" copied to clipboard`
                );
              }}
            >
              <ClipboardCopyIcon size={16} />
              Copy Target
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="gap-1.5">
                <TrashIcon size={16} />
                Delete Target
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DeleteTargetDialogContent id={target.id} />
      </Dialog>
    </AlertDialog>
  );
};

export default TargetTableDropdownMenu;
