import { deleteTarget } from "@/actions/config/target/delete-target";
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

interface DeleteTargetDialogContentProps {
  id: string;
}

const DeleteTargetDialogContent = ({ id }: DeleteTargetDialogContentProps) => {
  const { execute: executeDeleteTarget } = useAction(deleteTarget, {
    onSuccess: () => {
      toast.success("Target deleted successfully.");
    },
    onError: () => {
      toast.error("Cannot delete a target that is being used by id.");
    },
  });
  const handleContinueClick = () => executeDeleteTarget({ id: id });
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          You are about to delete this target. This action cannot be undone. Do
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

export default DeleteTargetDialogContent;
