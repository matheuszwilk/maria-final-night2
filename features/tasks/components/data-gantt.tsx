"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar, NavigationIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Task } from "@/features/tasks/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberAvatar } from "@/features/members/components/member-avatar";

interface DataGanttProps {
  data: Task[];
}

interface TaskBar {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee: string;
  assigneeName?: string;
  status: string;
}

const MONTH_FORMAT = "MMMM yyyy";

const getMonthOptions = () => {
  const options = [];
  const now = new Date();

  // Adicionar opção para todos os períodos
  options.push({ value: "all", label: "All periods" });

  // Adicionar mês atual
  options.push({
    value: format(now, "yyyy-MM"),
    label: format(now, MONTH_FORMAT),
  });

  // Adicionar 24 meses anteriores (2 anos)
  for (let i = 1; i <= 24; i++) {
    const date = subMonths(now, i);
    const value = format(date, "yyyy-MM");
    const label = format(date, MONTH_FORMAT);
    options.push({ value, label });
  }

  return options;
};

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case "BACKLOG":
      return "bg-pink-600";
    case "TODO":
      return "bg-blue-500";
    case "IN_PROGRESS":
      return "bg-yellow-500";
    case "IN_REVIEW":
      return "bg-purple-500";
    case "DONE":
      return "bg-emerald-500";
    case "DROPPED":
      return "bg-gray-600";
    default:
      return "bg-gray-400";
  }
};

export const DataGantt = ({ data }: DataGanttProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug logs para ajudar a identificar problemas
  useEffect(() => {
    try {
      console.log("Gantt data:", data?.length || 0, "tasks");
      if (data && data.length > 0) {
        // Verificar formato das datas em alguns exemplos
        const sampleTask = data[0];
        console.log("Sample task:", {
          id: sampleTask.id,
          name: sampleTask.name,
          dueDate: sampleTask.dueDate,
          createdAt: sampleTask.createdAt,
          updatedAt: sampleTask.updatedAt,
        });
      }
    } catch (e) {
      console.error("Error logging data:", e);
    }
  }, [data]);

  // Extract unique assignees for filter
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map();

    data.forEach((task) => {
      if (task.assignee) {
        uniqueAssignees.set(task.assignee.id, {
          id: task.assignee.id,
          name: task.assignee.name,
        });
      }
    });

    return Array.from(uniqueAssignees.values());
  }, [data]);

  // Filter tasks by month and assignee
  const filteredTasks = useMemo(() => {
    if (!data || !data.length) return [];

    try {
      // Quando estiver no modo "all", não filtrar por mês, apenas por assignee
      if (currentMonth === "all") {
        // Apenas filtrar por assignee, se selecionado
        return data
          .filter((task) => {
            if (selectedAssignee && task.assignee?.id !== selectedAssignee) {
              return false;
            }
            return true;
          })
          .sort((a, b) => {
            try {
              const dateA = a.createdAt
                ? typeof a.createdAt === "string"
                  ? parseISO(a.createdAt)
                  : new Date(a.createdAt)
                : new Date(0);
              const dateB = b.createdAt
                ? typeof b.createdAt === "string"
                  ? parseISO(b.createdAt)
                  : new Date(b.createdAt)
                : new Date(0);

              // If dates are invalid, fall back to a safe comparison
              if (!isValid(dateA) || !isValid(dateB)) {
                return 0;
              }

              // Sort in descending order (newest first)
              return dateB.getTime() - dateA.getTime();
            } catch (e) {
              console.warn("Error sorting tasks by date", e);
              return 0;
            }
          });
      }

      const [year, month] = currentMonth.split("-").map(Number);
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));

      return (
        data
          .filter((task) => {
            try {
              // Filter by assignee if selected
              if (selectedAssignee && task.assignee?.id !== selectedAssignee) {
                return false;
              }

              // MODIFICADO: Filtrar apenas pela data de criação (quando a tarefa "nasceu")
              let creationDate = null;
              if (task.createdAt) {
                try {
                  if (typeof task.createdAt === "string") {
                    creationDate = parseISO(task.createdAt);
                    if (!isValid(creationDate)) {
                      creationDate = new Date(task.createdAt);
                    }
                  }
                } catch (e) {
                  console.warn("Failed to parse createdAt");
                  return false;
                }
              }

              // Verificar se a data de criação está dentro do mês selecionado
              if (!creationDate || !isValid(creationDate)) {
                return false;
              }

              // Verificar ano e mês
              return (
                creationDate.getFullYear() === year &&
                creationDate.getMonth() === month - 1
              );
            } catch (e) {
              console.error("Error filtering task:", e);
              return false;
            }
          })
          // Sort tasks by creation date (newest first)
          .sort((a, b) => {
            try {
              const dateA = a.createdAt
                ? typeof a.createdAt === "string"
                  ? parseISO(a.createdAt)
                  : new Date(a.createdAt)
                : new Date(0);
              const dateB = b.createdAt
                ? typeof b.createdAt === "string"
                  ? parseISO(b.createdAt)
                  : new Date(b.createdAt)
                : new Date(0);

              // If dates are invalid, fall back to a safe comparison
              if (!isValid(dateA) || !isValid(dateB)) {
                return 0;
              }

              // Sort in descending order (newest first)
              return dateB.getTime() - dateA.getTime();
            } catch (e) {
              console.warn("Error sorting tasks by date", e);
              return 0;
            }
          })
      );
    } catch (e) {
      console.error("Error in filteredTasks:", e);
      return [];
    }
  }, [data, currentMonth, selectedAssignee]);

  // Navigate between months
  const handlePrevMonth = () => {
    try {
      const [year, month] = currentMonth.split("-").map(Number);
      const prevMonth = subMonths(new Date(year, month - 1), 1);
      setCurrentMonth(format(prevMonth, "yyyy-MM"));
    } catch (e) {
      console.error("Error navigating to previous month:", e);
      setError("Failed to navigate to previous month");
    }
  };

  const handleNextMonth = () => {
    try {
      const [year, month] = currentMonth.split("-").map(Number);
      const nextMonth = addMonths(new Date(year, month - 1), 1);
      setCurrentMonth(format(nextMonth, "yyyy-MM"));
    } catch (e) {
      console.error("Error navigating to next month:", e);
      setError("Failed to navigate to next month");
    }
  };

  const handleMonthChange = (value: string) => {
    setCurrentMonth(value);
  };

  // Navigation toolbar
  const GanttToolbar = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select value={currentMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Generate month headers for all periods view
  const renderAllPeriodsHeaders = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const now = new Date();
    const currentYear = now.getFullYear();

    return (
      <div className="flex sticky top-0 z-20 bg-background border-b border-border">
        <div className="w-96 min-w-96 border-r border-border font-medium px-3 py-2 sticky left-0 z-50 bg-background">
          Task
        </div>
        {months.map((month, index) => {
          // Calcular o número de dias no mês (considerando o ano atual para fevereiro)
          const daysInMonth = new Date(currentYear, index + 1, 0).getDate();

          return (
            <div
              key={month}
              className="flex flex-col border-r border-border"
              style={{ width: `${daysInMonth * 35}px` }}
            >
              <div
                className={`text-center p-2 font-medium border-b border-border ${index === now.getMonth() ? "bg-primary/10" : ""}`}
              >
                {month} {currentYear}
              </div>
              <div className="flex">
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <div
                    key={`${month}-${i + 1}`}
                    className={`border-r last:border-r-0 border-border text-xs text-center py-1 
                      ${now.getMonth() === index && now.getDate() === i + 1 ? "bg-primary/10 font-medium" : ""}`}
                    style={{ width: "35px" }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate date headers for Gantt chart for monthly view
  const renderDateHeaders = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const days = [];

    for (let day = 1; day <= endDate.getDate(); day++) {
      days.push(
        <div
          key={day}
          className={`text-center border-r border-border min-w-[35px] flex-shrink-0 text-xs py-1
            ${
              new Date().getDate() === day &&
              new Date().getMonth() === month - 1
                ? "bg-primary/10 font-medium"
                : ""
            }`}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="flex border-b border-border sticky top-0 bg-background z-20">
        <div className="w-96 min-w-96 border-r border-border font-medium px-3 py-1 sticky left-0 z-50 bg-background">
          Task
        </div>
        <div className="flex overflow-x-auto">{days}</div>
      </div>
    );
  };

  // Generate task bars
  const renderTaskBars = () => {
    if (!filteredTasks.length) {
      return (
        <div className="flex justify-center items-center h-40 text-muted-foreground">
          No tasks found for the selected period
        </div>
      );
    }

    try {
      // Se for "all periods", mostrar gantt do ano inteiro
      if (currentMonth === "all") {
        const now = new Date();
        const currentYear = now.getFullYear();

        return filteredTasks
          .map((task) => {
            try {
              // Parse dates
              let requestedDate = null;

              if (task.createdAt && typeof task.createdAt === "string") {
                try {
                  requestedDate = parseISO(task.createdAt);
                  if (!isValid(requestedDate)) {
                    requestedDate = new Date(task.createdAt);
                  }
                } catch (e) {
                  console.warn("Failed to parse createdAt");
                }
              }

              let dueDate = null;
              if (task.dueDate && typeof task.dueDate === "string") {
                try {
                  dueDate = parseISO(task.dueDate);
                  if (!isValid(dueDate)) {
                    dueDate = new Date(task.dueDate);
                  }
                } catch (e) {
                  console.warn("Failed to parse dueDate");
                }
              }

              let finishedDate = null;
              if (task.status === "DONE" && task.updatedAt) {
                try {
                  if (typeof task.updatedAt === "string") {
                    finishedDate = parseISO(task.updatedAt);
                    if (!isValid(finishedDate)) {
                      finishedDate = new Date(task.updatedAt);
                    }
                  }
                } catch (e) {
                  console.warn("Failed to parse updatedAt");
                }
              }

              // Calculate exact start and end dates for positioning
              let startMonth = 0;
              let startDay = 1;

              if (requestedDate && isValid(requestedDate)) {
                startMonth = requestedDate.getMonth();
                startDay = requestedDate.getDate();
              }

              // A barra SEMPRE vai da data solicitada até a data de vencimento
              // A data de conclusão será mostrada apenas como um marcador
              let endMonth, endDay;

              if (dueDate && isValid(dueDate)) {
                // Sempre usar a data de vencimento para o fim da barra
                endMonth = dueDate.getMonth();
                endDay = dueDate.getDate();
              } else {
                // Fallback se não houver data de vencimento: usar +7 dias da data de início
                endMonth = startMonth;
                endDay = startDay + 7;

                // Ajuste se o dia ficar fora do mês
                const daysInStartMonth = new Date(
                  currentYear,
                  startMonth + 1,
                  0
                ).getDate();
                if (endDay > daysInStartMonth) {
                  endMonth = (startMonth + 1) % 12;
                  endDay = endDay - daysInStartMonth;
                }
              }

              // Calculate left position based on month and day
              let left = 0;
              for (let m = 0; m < startMonth; m++) {
                const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
                left += daysInMonth * 35;
              }
              left += (startDay - 1) * 35;

              // Calculate width based on start and end dates
              let width = 0;
              if (startMonth === endMonth) {
                width = (endDay - startDay + 1) * 35;
              } else {
                // Add days from start month
                const daysInStartMonth = new Date(
                  currentYear,
                  startMonth + 1,
                  0
                ).getDate();
                width += (daysInStartMonth - startDay + 1) * 35;

                // Add days from months in between
                for (let m = startMonth + 1; m < endMonth; m++) {
                  const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
                  width += daysInMonth * 35;
                }

                // Add days from end month (apenas até o dia final, não o mês inteiro)
                width += endDay * 35;
              }

              // Ensure minimum width
              width = Math.max(35, width);

              // Calculate finished date marker position
              let finishedMarkerLeft = null;
              let finishedOnTime = null;

              if (finishedDate && isValid(finishedDate)) {
                const finishedMonth = finishedDate.getMonth();
                const finishedDay = finishedDate.getDate();

                let markerLeft = 0;
                for (let m = 0; m < finishedMonth; m++) {
                  const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
                  markerLeft += daysInMonth * 35;
                }
                markerLeft += (finishedDay - 1) * 35;

                finishedMarkerLeft = `${markerLeft}px`;

                if (dueDate && isValid(dueDate)) {
                  // Comparar apenas as datas, ignorando as horas
                  const dueDateOnly = new Date(
                    dueDate.getFullYear(),
                    dueDate.getMonth(),
                    dueDate.getDate()
                  );
                  const finishedDateOnly = new Date(
                    finishedDate.getFullYear(),
                    finishedDate.getMonth(),
                    finishedDate.getDate()
                  );
                  finishedOnTime = finishedDateOnly <= dueDateOnly;
                }
              }

              // Determine color based on status
              const statusColor = getTaskStatusColor(task.status);

              return (
                <div
                  key={task.id}
                  className="flex min-h-[40px] border-b border-border hover:bg-muted/20"
                >
                  <div className="w-96 min-w-96 border-r border-border px-3 py-2 flex items-center sticky left-0 z-50 bg-background">
                    <div className="mr-2 flex-shrink-0">
                      {task.assignee && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <MemberAvatar
                                  className="h-6 w-6"
                                  name={task.assignee.name}
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {task.assignee.name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex flex-col w-full overflow-visible">
                      <span className="font-medium break-words whitespace-normal">
                        {task.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {task.assignee ? task.assignee.name : "Unassigned"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Project: {task.project?.name || "Unknown project"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow relative overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative h-6 top-1/2 -translate-y-1/2">
                            {/* Barra de Requested até Due Date - modo All Periods */}
                            <div
                              className={`absolute h-6 rounded-sm ${statusColor} opacity-50`}
                              style={{ width: `${width}px`, left: `${left}px` }}
                            >
                              {task.assignee &&
                                typeof width === "number" &&
                                width > 70 && (
                                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                    <span className="text-white text-xs font-medium px-1">
                                      {task.assignee.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                )}
                            </div>

                            {/* Marcador da Finished Date */}
                            {finishedMarkerLeft && (
                              <div
                                className={`absolute h-6 w-3 rounded-sm ${
                                  finishedOnTime ? "bg-green-600" : "bg-red-600"
                                } opacity-90`}
                                style={{ left: finishedMarkerLeft }}
                              >
                                <div className="absolute -top-4 left-0 transform -translate-x-1/2">
                                  <span
                                    className={`text-xs ${
                                      finishedOnTime
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>
                              <strong>{task.name}</strong>
                            </p>
                            <p className="flex items-center gap-1">
                              <span>Owner:</span>
                              {task.assignee ? (
                                <span className="font-medium">
                                  {task.assignee.name}
                                </span>
                              ) : (
                                <span className="italic">Unassigned</span>
                              )}
                            </p>
                            <p>Status: {task.status}</p>
                            {requestedDate && isValid(requestedDate) && (
                              <p>
                                Requested:{" "}
                                {format(requestedDate, "dd MMM yyyy")}
                              </p>
                            )}
                            {dueDate && isValid(dueDate) && (
                              <p>Due: {format(dueDate, "dd MMM yyyy")}</p>
                            )}
                            {finishedDate && isValid(finishedDate) && (
                              <p
                                className={
                                  finishedOnTime
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                Completed: {format(finishedDate, "dd MMM yyyy")}
                                {finishedOnTime ? " (on time)" : " (late)"}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            } catch (e) {
              console.error("Error rendering task in annual view:", e, task);
              return null;
            }
          })
          .filter(Boolean);
      }

      const [year, month] = currentMonth.split("-").map(Number);
      const daysInMonth = endOfMonth(new Date(year, month - 1)).getDate();

      return filteredTasks
        .map((task) => {
          try {
            // Verificar e obter datas com tratamento melhorado
            let requestedDate = null;
            if ("requestedDate" in task && task.requestedDate) {
              try {
                // Verificar se requestedDate é uma string
                if (typeof task.requestedDate === "string") {
                  requestedDate = parseISO(task.requestedDate);
                  if (!isValid(requestedDate)) {
                    requestedDate = new Date(task.requestedDate);
                  }
                }
              } catch (e) {
                // Fallback para createdAt se requestedDate não estiver disponível
                if (task.createdAt) {
                  try {
                    if (typeof task.createdAt === "string") {
                      requestedDate = parseISO(task.createdAt);
                      if (!isValid(requestedDate)) {
                        requestedDate = new Date(task.createdAt);
                      }
                    }
                  } catch (err) {
                    console.warn("Failed to parse dates for task", task.id);
                  }
                }
              }
            } else if (task.createdAt) {
              try {
                if (typeof task.createdAt === "string") {
                  requestedDate = parseISO(task.createdAt);
                  if (!isValid(requestedDate)) {
                    requestedDate = new Date(task.createdAt);
                  }
                }
              } catch (e) {
                console.warn("Failed to parse createdAt");
              }
            }

            let dueDate = null;
            if (task.dueDate) {
              try {
                if (typeof task.dueDate === "string") {
                  dueDate = parseISO(task.dueDate);
                  if (!isValid(dueDate)) {
                    dueDate = new Date(task.dueDate);
                  }
                }
              } catch (e) {
                console.warn("Failed to parse dueDate", task.dueDate);
              }
            }

            let finishedDate = null;
            if (task.status === "DONE" && task.updatedAt) {
              try {
                if (typeof task.updatedAt === "string") {
                  finishedDate = parseISO(task.updatedAt);
                  if (!isValid(finishedDate)) {
                    finishedDate = new Date(task.updatedAt);
                  }
                }
              } catch (e) {
                console.warn("Failed to parse updatedAt");
              }
            }

            // Calculate start position (requested date or start of month)
            let startDay = 1;
            if (
              requestedDate &&
              isValid(requestedDate) &&
              requestedDate.getMonth() === month - 1 &&
              requestedDate.getFullYear() === year
            ) {
              startDay = requestedDate.getDate();
            }

            // Calculate end position (due date or end of month)
            let endDay = daysInMonth;
            if (
              dueDate &&
              isValid(dueDate) &&
              dueDate.getMonth() === month - 1 &&
              dueDate.getFullYear() === year
            ) {
              endDay = dueDate.getDate();
            }

            // Verificar se a tarefa foi concluída no prazo
            let finishedOnTime = null;
            let finishedPos = null;

            if (finishedDate && isValid(finishedDate)) {
              if (dueDate && isValid(dueDate)) {
                // Comparar apenas as datas, ignorando as horas
                const dueDateOnly = new Date(
                  dueDate.getFullYear(),
                  dueDate.getMonth(),
                  dueDate.getDate()
                );
                const finishedDateOnly = new Date(
                  finishedDate.getFullYear(),
                  finishedDate.getMonth(),
                  finishedDate.getDate()
                );
                finishedOnTime = finishedDateOnly <= dueDateOnly;
              }

              // Calcular posição do marcador de conclusão
              if (
                finishedDate.getMonth() === month - 1 &&
                finishedDate.getFullYear() === year
              ) {
                finishedPos = finishedDate.getDate();
              }
            }

            // Handle cases where task spans multiple months
            if (endDay < startDay) {
              endDay = daysInMonth;
            }

            // Calculate bar width for requested to due date
            const width = `${Math.max(1, (endDay - startDay + 1) * 35)}px`;
            const left = `${(startDay - 1) * 35}px`;

            // Determine color based on status
            const statusColor = getTaskStatusColor(task.status);

            // Calculate position for finished date marker
            const finishedMarkerLeft = finishedPos
              ? `${(finishedPos - 1) * 35}px`
              : null;

            return (
              <div
                key={task.id}
                className="flex min-h-[40px] border-b border-border hover:bg-muted/20"
              >
                <div className="w-96 min-w-96 border-r border-border px-3 py-2 flex items-center sticky left-0 z-50 bg-background">
                  <div className="mr-2 flex-shrink-0">
                    {task.assignee && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <MemberAvatar
                                className="h-6 w-6"
                                name={task.assignee.name}
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{task.assignee.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex flex-col w-full overflow-visible">
                    <span className="font-medium break-words whitespace-normal">
                      {task.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {task.assignee ? task.assignee.name : "Unassigned"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Project: {task.project?.name || "Unknown project"}
                    </span>
                  </div>
                </div>

                <div className="flex-grow relative overflow-hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative h-6 top-1/2 -translate-y-1/2">
                          {/* Barra principal (requested até due date) - modo mensal */}
                          <div
                            className={`absolute h-6 rounded-sm ${statusColor} opacity-50`}
                            style={{ width, left }}
                          >
                            {task.assignee &&
                              typeof width === "string" &&
                              parseFloat(width.replace("px", "")) > 70 && (
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                  <span className="text-white text-xs font-medium px-1">
                                    {task.assignee.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Marcador da Finished Date */}
                          {finishedMarkerLeft && (
                            <div
                              className={`absolute h-6 w-3 rounded-sm ${
                                finishedOnTime ? "bg-green-600" : "bg-red-600"
                              } opacity-90`}
                              style={{ left: finishedMarkerLeft }}
                            >
                              <div className="absolute -top-4 left-0 transform -translate-x-1/2">
                                <span
                                  className={`text-xs ${
                                    finishedOnTime
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  ✓
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p>
                            <strong>{task.name}</strong>
                          </p>
                          <p className="flex items-center gap-1">
                            <span>Owner:</span>
                            {task.assignee ? (
                              <span className="font-medium">
                                {task.assignee.name}
                              </span>
                            ) : (
                              <span className="italic">Unassigned</span>
                            )}
                          </p>
                          <p>Status: {task.status}</p>
                          {requestedDate && isValid(requestedDate) && (
                            <p>
                              Requested: {format(requestedDate, "dd MMM yyyy")}
                            </p>
                          )}
                          {dueDate && isValid(dueDate) && (
                            <p>Due: {format(dueDate, "dd MMM yyyy")}</p>
                          )}
                          {finishedDate && isValid(finishedDate) && (
                            <p
                              className={
                                finishedOnTime
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              Completed: {format(finishedDate, "dd MMM yyyy")}
                              {finishedOnTime ? " (on time)" : " (late)"}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            );
          } catch (e) {
            console.error("Error rendering task bar:", e, task);
            return null;
          }
        })
        .filter(Boolean); // Filtrar quaisquer nulos resultantes de erros
    } catch (e) {
      console.error("Error in renderTaskBars:", e);
      return (
        <div className="flex justify-center items-center h-40 text-muted-foreground">
          Error rendering tasks
        </div>
      );
    }
  };

  return (
    <Card className="w-full h-full overflow-hidden border">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <CardTitle className="text-lg font-medium">Gantt Chart</CardTitle>
          </div>
          {error && (
            <div className="text-red-500 text-sm">
              Error: {error}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Visualize task timelines with requested and due dates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <GanttToolbar />
        </div>
        {data && data.length === 0 && (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            No tasks found. Please create some tasks first.
          </div>
        )}
        {data && data.length > 0 && (
          <div
            className="gantt-outer-container"
            style={{
              height: "calc(100vh - 300px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="gantt-scrollable-container"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflowX: "scroll",
                overflowY: "scroll",
              }}
            >
              <div
                className="gantt-content"
                style={{
                  minWidth: "1200px",
                  width: "max-content",
                }}
              >
                {currentMonth === "all" ? (
                  <>
                    <div className="sticky top-0 z-20 bg-background">
                      {renderAllPeriodsHeaders()}
                    </div>
                    <div>{renderTaskBars()}</div>
                  </>
                ) : (
                  <>
                    {renderDateHeaders()}
                    {renderTaskBars()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {!data && (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            Loading tasks...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
