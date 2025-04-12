"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TargetSchema } from "@/actions/config/target/create-target/schema";
import { createTargetAction } from "@/actions/config/target/create-target";
import { getOrgAndLineData } from "@/app/_data-access/andon/orgline/get-org-and-line";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTargetDialogContentProps {
  setDialogIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateTargetDialogContent = ({
  setDialogIsOpen,
}: CreateTargetDialogContentProps) => {
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  useEffect(() => {
    const fetchOrgAndLines = async () => {
      const orgLineData = await getOrgAndLineData();
      const uniqueOrgs = Array.from(
        new Set(orgLineData.map((item) => item.organization))
      );
      setOrganizations(uniqueOrgs.filter(Boolean) as string[]);
    };
    fetchOrgAndLines();
  }, []);

  useEffect(() => {
    const fetchLines = async () => {
      if (selectedOrg) {
        const orgLineData = await getOrgAndLineData();
        const filteredLines = orgLineData
          .filter((item) => item.organization === selectedOrg)
          .map((item) => item.equipment_line)
          .filter(Boolean) as string[];
        setLines(filteredLines);
      } else {
        setLines([]);
      }
    };
    fetchLines();
  }, [selectedOrg]);

  const form = useForm<z.infer<typeof TargetSchema>>({
    resolver: zodResolver(TargetSchema),
    defaultValues: {
      projectName: "andon",
      organization: "",
      line: "",
      year: "",
      target: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const onSubmit = async (values: z.infer<typeof TargetSchema>) => {
    const result = await createTargetAction(values);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success(result.success);
      setDialogIsOpen(false);
      form.reset();
    }
  };

  return (
    <DialogContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <DialogHeader>
            <DialogTitle>Create Target</DialogTitle>
            <DialogDescription>
              Enter target information below
            </DialogDescription>
          </DialogHeader>

          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="andon">andon</SelectItem>
                      <SelectItem value="idle">idle</SelectItem>
                    </SelectContent>
                  </Select>
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedOrg(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedOrg}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select line" />
                    </SelectTrigger>
                    <SelectContent>
                      {lines.map((line) => (
                        <SelectItem key={line} value={line}>
                          {line}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter year (YYYY)"
                    maxLength={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter target value"
                    min={0}
                    max={1}
                    step={0.000001}
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 && value <= 1) {
                        // Round to 6 decimal places
                        const roundedValue = Number(value.toFixed(6));
                        field.onChange(roundedValue);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" type="reset">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="gap-1.5"
            >
              {form.formState.isSubmitting && (
                <Loader2Icon className="animate-spin" size={16} />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CreateTargetDialogContent;
