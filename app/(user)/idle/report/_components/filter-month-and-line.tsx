"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrgAndLineData } from "@/app/_data-access/andon/orgline/get-org-and-line";

interface SelectMonthProps {
  initialMonth: string;
  initialOrg: string;
  initialLine: string;
}

interface Option {
  value: string;
  label: string;
}

const INITIAL_YEAR = 2024;

const SelectMonthAndLine: React.FC<SelectMonthProps> = ({
  initialMonth,
  initialOrg,
  initialLine,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedOrg, setSelectedOrg] = useState(initialOrg);
  const [selectedLine, setSelectedLine] = useState(initialLine);
  const [organizations, setOrganizations] = useState<Option[]>([
    { value: "All", label: "All Organizations" },
  ]);
  const [lines, setLines] = useState<Option[]>([
    { value: "All", label: "All Lines" },
  ]);
  const [allLineOptions, setAllLineOptions] = useState<Option[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrlParams = (month: string, org: string, line: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    params.set("org", org);
    params.set("line", line);
    router.push(`/idle/report?${params.toString()}`);
  };

  useEffect(() => {
    const fetchOrgAndLines = async () => {
      const orgLineData = await getOrgAndLineData();
      // Get unique organizations
      const uniqueOrgs = Array.from(
        new Set(orgLineData.map((item) => item.organization))
      );
      const orgOptions = uniqueOrgs
        .filter((org) => org) // Filter out null values
        .map((org) => ({
          value: org!,
          label: org!,
        }));
      setOrganizations([
        { value: "All", label: "All Organizations" },
        ...orgOptions,
      ]);

      // Get lines
      const lineOptions = orgLineData
        .filter((line) => line.equipment_line) // Filter out null values
        .map((line) => ({
          value: line.equipment_line!,
          label: line.equipment_line!,
          org: line.organization,
        }));
      setAllLineOptions([{ value: "All", label: "All Lines" }, ...lineOptions]);
      setLines([{ value: "All", label: "All Lines" }, ...lineOptions]);
    };

    fetchOrgAndLines();
  }, []);

  useEffect(() => {
    setSelectedMonth(initialMonth);
    setSelectedOrg(initialOrg);
    setSelectedLine(initialLine);
  }, [initialMonth, initialOrg, initialLine]);

  useEffect(() => {
    if (selectedOrg === "All") {
      setLines(allLineOptions);
    } else {
      const filteredLines = allLineOptions.filter(
        (line) =>
          line.value === "All" || ("org" in line && line.org === selectedOrg)
      );
      setLines(filteredLines);
      if (!filteredLines.find((line) => line.value === selectedLine)) {
        setSelectedLine("All");
        updateUrlParams(selectedMonth, selectedOrg, "All");
      }
    }
  }, [
    selectedOrg,
    allLineOptions,
    selectedLine,
    selectedMonth,
    updateUrlParams,
  ]);

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    updateUrlParams(newMonth, selectedOrg, selectedLine);
  };

  const handleOrgChange = (newOrg: string) => {
    setSelectedOrg(newOrg);
    updateUrlParams(selectedMonth, newOrg, selectedLine);
  };

  const handleLineChange = (newLine: string) => {
    setSelectedLine(newLine);
    updateUrlParams(selectedMonth, selectedOrg, newLine);
  };

  const monthOptions = useMemo(() => {
    const options: Option[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    for (let year = INITIAL_YEAR; year <= currentYear; year++) {
      const monthLimit = year === currentYear ? currentMonth : 12;

      for (let month = 1; month <= monthLimit; month++) {
        const monthString = month.toString().padStart(2, "0");
        const value = `${year}-${monthString}`;
        options.push({ value, label: value });
      }
    }

    return options.reverse();
  }, []);

  return (
    <>
      <Select onValueChange={handleMonthChange} defaultValue={selectedMonth}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={handleOrgChange} value={selectedOrg}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select an organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={handleLineChange} value={selectedLine}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a line" />
        </SelectTrigger>
        <SelectContent>
          {lines.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectMonthAndLine;
