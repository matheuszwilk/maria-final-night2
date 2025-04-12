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
import DeleteEmailDialogContent from "./delete-dialog-content";
import { EmailDataDto } from "@/app/_data-access/email/get-all-email";

interface EmailTableDropdownMenuProps {
  email: EmailDataDto;
}

const EmailTableDropdownMenu = ({ email }: EmailTableDropdownMenuProps) => {
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
                navigator.clipboard.writeText(email.email);
                toast.success(`Email "${email.email}" copied to clipboard`);
              }}
            >
              <ClipboardCopyIcon size={16} />
              Copy Email
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="gap-1.5">
                <TrashIcon size={16} />
                Delete Email
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DeleteEmailDialogContent emailId={email.id} />
      </Dialog>
    </AlertDialog>
  );
};

export default EmailTableDropdownMenu;
