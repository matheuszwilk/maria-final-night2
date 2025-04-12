import { deleteEmail } from "@/actions/config/email/delete-email";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface DeleteEmailDialogContentProps {
  emailId: string;
}

const DeleteEmailDialogContent = ({
  emailId,
}: DeleteEmailDialogContentProps) => {
  const { execute: executeDeleteEmail } = useAction(deleteEmail, {
    onSuccess: () => {
      toast.success("Email deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete email.");
    },
  });
  const handleContinueClick = () => executeDeleteEmail({ id: emailId });
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          You are about to delete this email. This action cannot be undone. Do
          you want to continue?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleContinueClick}>
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default DeleteEmailDialogContent;
