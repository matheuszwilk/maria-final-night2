"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmailSchema } from "@/actions/config/email/create-email/schema";
import { createEmailAction } from "@/actions/config/email/create-email";
import {
  getDepartments,
  DepartmentDto,
} from "@/app/_data-access/idle/departament/get-departament";
import {
  getOrgAndLineData,
  OrgAndLineDataDto,
} from "@/app/_data-access/andon/orgline/get-org-and-line";

interface CreateDialogContentProps {
  isOpen: boolean;
  setDialogIsOpen: (open: boolean) => void;
}

export const CreateDialogContent = ({
  isOpen,
  setDialogIsOpen,
}: CreateDialogContentProps) => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [organizations, setOrganizations] = useState<OrgAndLineDataDto[]>([]);

  useEffect(() => {
    const loadDepartments = async () => {
      const deps = await getDepartments();
      setDepartments(deps);
    };
    const loadOrganizations = async () => {
      const orgs = await getOrgAndLineData();
      // Filter unique organizations
      const uniqueOrgs = orgs.filter(
        (org, index, self) =>
          index === self.findIndex((o) => o.organization === org.organization)
      );
      setOrganizations(uniqueOrgs);
    };
    loadDepartments();
    loadOrganizations();
  }, []);

  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
      organization: "",
      department: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof EmailSchema>) => {
    try {
      const result = await createEmailAction(values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(result.success);
        setDialogIsOpen(false);
        form.reset();
        // Opcional: Recarregar os dados após criar
        window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create email");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setDialogIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Email</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter email address"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(
                          (org) =>
                            org.organization && (
                              <SelectItem key={org.id} value={org.organization}>
                                {org.organization}
                              </SelectItem>
                            )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(
                          (dept) =>
                            dept.primary_cause_dept && (
                              <SelectItem
                                key={dept.primary_cause_dept}
                                value={dept.primary_cause_dept}
                              >
                                {dept.primary_cause_dept}
                              </SelectItem>
                            )
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDialogIsOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDialogContent;
