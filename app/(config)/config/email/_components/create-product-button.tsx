"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

import { useState } from "react";
import CreateEmailDialogContent from "./create-dialog-content";

const CreateEmailButton = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <PlusIcon size={20} />
          New Email
        </Button>
      </DialogTrigger>
      <CreateEmailDialogContent
        isOpen={dialogIsOpen}
        setDialogIsOpen={setDialogIsOpen}
      />
    </Dialog>
  );
};

export default CreateEmailButton;
