"use client";

import Link from "next/link";
import {
  formatDistanceToNow,
  format,
  parse,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
  isValid,
  differenceInDays,
  differenceInBusinessDays,
  isBefore,
  addDays,
  isPast,
  isToday,
  subWeeks,
} from "date-fns";
import {
  BarChart as BarChartIcon,
  CalendarIcon,
  Clock,
  FilterIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  PlusIcon,
  SettingsIcon,
  Users2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Timer,
  AlertCircle,
  ListTodo,
  PlayCircle,
  FileSearch,
  CheckSquare,
  XCircle,
  Archive,
  Rocket,
  Target,
  Calendar,
  Flag,
  Briefcase,
  Award,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  ComponentType,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useTheme } from "next-themes";

import { Task } from "@/features/tasks/types";
import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";

import { Button } from "@/components/ui/button";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ptBR } from "date-fns/locale";

// Helper function to generate month filter options for the last 24 months
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const date = subMonths(now, i);
    const value = format(date, "yyyy-MM");
    // Format in English: "January 2025"
    const label = format(date, "MMMM yyyy");
    options.push({ value, label });
  }

  return options;
};

// Helper function to generate week options for the last 52 weeks
const generateWeekOptions = () => {
  const options = [];
  const now = new Date();

  // Start with current date
  let currentDate = new Date(now);
  const seenWeeks = new Set(); // To avoid duplicates

  // Generate up to 52 weeks (approximately 1 year)
  for (let i = 0; i < 52; i++) {
    // Adjust to the start of the current week
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as week start

    // Get ISO week number - more accurate than format("w")
    const weekNumber = format(weekStart, "II"); // ISO week number
    const year = format(weekStart, "yyyy");

    // Create a unique value for this week
    const value = `${year}-${weekNumber}`;

    // Check if we already have this week to avoid duplications
    if (!seenWeeks.has(value)) {
      seenWeeks.add(value);

      // Format as "Week X - YYYY" in English
      const label = `Week ${weekNumber} - ${year}`;
      options.push({ value, label });

      // Move back 7 days for next iteration
      currentDate = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      // If we already have this week, adjust date to go further back
      currentDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      i--; // Don't count this duplicate iteration
    }
  }

  return options;
};

// Defina um componente personalizado para Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (active && payload && payload.length) {
    // Verificar se temos o nome completo no payload
    const fullName = payload[0]?.payload?.fullName || label;

    return (
      <div
        className={`px-3 py-2 rounded-md shadow-md ${isDark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
      >
        <p className="font-medium text-sm">{fullName}</p>
        {payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="block w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [filterType, setFilterType] = useState<"month" | "week">("month");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Generate filter options
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const weekOptions = useMemo(() => generateWeekOptions(), []);

  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const isLoading =
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers;

  // Set default filter to current month on initial load
  useEffect(() => {
    if (!isLoading && monthOptions.length > 0) {
      setTimeFilter(monthOptions[0].value);
    }
  }, [isLoading, monthOptions]);

  // Handle filter type change function
  const handleFilterTypeChange = useCallback(
    (type: "month" | "week") => {
      setFilterType(type);
      // Set default value for the new filter type
      if (type === "month" && monthOptions.length > 0) {
        setTimeFilter(monthOptions[0].value);
      } else if (type === "week" && weekOptions.length > 0) {
        setTimeFilter(weekOptions[0].value);
      }
    },
    [monthOptions, weekOptions]
  );

  // Filter tasks based on the selected time filter
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.documents.filter((task) => {
      if (timeFilter === "all") return true;

      const taskDate = new Date(task.createdAt);
      if (!isValid(taskDate)) return false;

      if (filterType === "month") {
        if (timeFilter.match(/^\d{4}-\d{2}$/)) {
          const [year, month] = timeFilter.split("-").map(Number);
          const filterDate = new Date(year, month - 1); // Month is 0-indexed in JS
          const start = startOfMonth(filterDate);
          const end = endOfMonth(filterDate);
          return isWithinInterval(taskDate, { start, end });
        }
      } else if (filterType === "week") {
        if (timeFilter.match(/^\d{4}-\d{2}$/)) {
          const [year, week] = timeFilter.split("-").map(Number);

          // Calculate the first day of the given ISO week
          // ISO weeks: week 1 is the week containing the first Thursday of the year
          const firstDayOfYear = new Date(year, 0, 1);
          const dayOfWeek = firstDayOfYear.getDay(); // 0 = Sunday, 1 = Monday, etc.

          // Calculate days to first Thursday
          const daysToFirstThursday =
            dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
          const firstThursday = new Date(firstDayOfYear);
          firstThursday.setDate(firstDayOfYear.getDate() + daysToFirstThursday);

          // The Monday of the week containing the first Thursday
          const firstISOWeekStart = new Date(firstThursday);
          firstISOWeekStart.setDate(firstThursday.getDate() - 3);

          // Move to our target week
          const weekStart = new Date(firstISOWeekStart);
          weekStart.setDate(firstISOWeekStart.getDate() + (week - 1) * 7);

          // End date (Sunday)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
        }
      }

      return false;
    });
  }, [tasks, timeFilter, filterType]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      DROPPED: 0,
    };

    filteredTasks.forEach((task) => {
      if (task.status in counts) {
        counts[task.status]++;
      }
    });

    return counts;
  }, [filteredTasks]);

  // Member performance
  const memberPerformance = useMemo(() => {
    if (!members) return [];

    return members.documents
      .map((member) => {
        const assignedTasks = filteredTasks.filter(
          (task) => task.assignee?.id === member.id
        );
        const completedTasks = assignedTasks.filter(
          (task) => task.status === "DONE"
        );

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          assignedCount: assignedTasks.length,
          completedCount: completedTasks.length,
          completionRate: assignedTasks.length
            ? (completedTasks.length / assignedTasks.length) * 100
            : 0,
        };
      })
      .sort((a, b) => b.completedCount - a.completedCount);
  }, [members, filteredTasks]);

  // Calculate previous period tasks
  const previousPeriodTasks = useMemo(() => {
    if (!tasks) return [];

    if (timeFilter === "all") return tasks.documents;

    if (filterType === "month" && timeFilter.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = timeFilter.split("-").map(Number);
      const currentPeriodStart = startOfMonth(new Date(year, month - 1));
      const previousPeriodStart = subMonths(currentPeriodStart, 1);
      const previousPeriodEnd = endOfMonth(previousPeriodStart);

      return tasks.documents.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return isWithinInterval(taskDate, {
          start: previousPeriodStart,
          end: previousPeriodEnd,
        });
      });
    } else if (filterType === "week" && timeFilter.match(/^\d{4}-\d{2}$/)) {
      const [year, week] = timeFilter.split("-").map(Number);

      // Calculate current week dates using the same logic as in filteredTasks
      const firstDayOfYear = new Date(year, 0, 1);
      const dayOfWeek = firstDayOfYear.getDay();
      const daysToFirstThursday =
        dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
      const firstThursday = new Date(firstDayOfYear);
      firstThursday.setDate(firstDayOfYear.getDate() + daysToFirstThursday);
      const firstISOWeekStart = new Date(firstThursday);
      firstISOWeekStart.setDate(firstThursday.getDate() - 3);

      // Current week
      const currentWeekStart = new Date(firstISOWeekStart);
      currentWeekStart.setDate(firstISOWeekStart.getDate() + (week - 1) * 7);

      // Previous week
      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(currentWeekStart.getDate() - 7);
      const previousWeekEnd = new Date(previousWeekStart);
      previousWeekEnd.setDate(previousWeekStart.getDate() + 6);

      return tasks.documents.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return isWithinInterval(taskDate, {
          start: previousWeekStart,
          end: previousWeekEnd,
        });
      });
    }

    return [];
  }, [tasks, timeFilter, filterType]);

  // Metrics
  const metrics = useMemo(() => {
    // Default values to avoid errors
    const defaultMetrics = {
      averageCompletionTime: 0,
      completionRate: 0,
      overdueTasks: 0,
      atRiskTasks: 0,
      blockedTasks: 0,
      trend: 0,
      previousTotal: previousPeriodTasks.length,
      currentTotal: filteredTasks.length,
    };

    // Bail out early if we don't have the necessary data
    if (!filteredTasks.length) return defaultMetrics;

    // Análise de velocidade: média de dias para concluir tarefas
    const completedTasks = filteredTasks.filter(
      (task) => task.status === "DONE"
    );
    let averageCompletionTime = 0;

    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((total, task) => {
        const createdDate = new Date(task.createdAt);
        const completedDate = task.updatedAt
          ? new Date(task.updatedAt)
          : new Date();
        return total + differenceInBusinessDays(completedDate, createdDate);
      }, 0);
      averageCompletionTime = totalDays / completedTasks.length;
    }

    // Taxa de conclusão: tarefas concluídas / total
    const completionRate =
      filteredTasks.length > 0
        ? (completedTasks.length / filteredTasks.length) * 100
        : 0;

    // Tarefas atrasadas
    const overdueTasks = filteredTasks.filter((task) => {
      return (
        task.status !== "DONE" &&
        task.dueDate &&
        isPast(new Date(task.dueDate)) &&
        !isToday(new Date(task.dueDate))
      );
    });

    // Tarefas em risco (vencem nos próximos 2 dias)
    const atRiskTasks = filteredTasks.filter((task) => {
      if (task.status === "DONE" || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const twoDaysFromNow = addDays(today, 2);
      return isWithinInterval(dueDate, { start: today, end: twoDaysFromNow });
    });

    // Bloqueios (tarefas paradas em IN_PROGRESS por mais de 5 dias)
    const blockedTasks = filteredTasks.filter((task) => {
      return (
        task.status === "IN_PROGRESS" &&
        task.updatedAt &&
        differenceInDays(new Date(), new Date(task.updatedAt)) > 5
      );
    });

    // Tendência (comparação com período anterior)
    const currentTotal = filteredTasks.length;
    const previousTotal = previousPeriodTasks.length;
    const trend =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
      averageCompletionTime,
      completionRate,
      overdueTasks: overdueTasks.length,
      atRiskTasks: atRiskTasks.length,
      blockedTasks: blockedTasks.length,
      trend,
      previousTotal,
      currentTotal,
    };
  }, [filteredTasks, previousPeriodTasks]);

  // Chart data
  const chartData = useMemo(() => {
    // Default values to avoid errors
    const defaultChartData = {
      statusDistribution: [],
      memberPerformanceData: [],
      trendData: [],
    };

    // Bail out if we don't have all the required data
    if (!statusCounts || !memberPerformance) return defaultChartData;

    // Distribuição por status para gráfico de barras e pizza
    const statusDistribution = [
      { name: "Backlog", value: statusCounts.BACKLOG, color: "#db2777" }, // pink-600
      { name: "Todo", value: statusCounts.TODO, color: "#3b82f6" }, // blue-500
      {
        name: "In Progress",
        value: statusCounts.IN_PROGRESS,
        color: "#eab308",
      }, // yellow-500
      { name: "In Review", value: statusCounts.IN_REVIEW, color: "#a855f7" }, // purple-500
      { name: "Done", value: statusCounts.DONE, color: "#10b981" }, // emerald-500
      { name: "Dropped", value: statusCounts.DROPPED, color: "#4b5563" }, // gray-600
    ];

    // Dados para gráfico de desempenho por membro (todos os membros)
    const memberPerformanceData = memberPerformance.map((member) => {
      // Extrair apenas o primeiro nome
      const firstName = member.name.split(" ")[0];

      return {
        name: firstName,
        assigned: member.assignedCount,
        completed: member.completedCount,
        fullName: member.name, // Mantemos o nome completo para tooltips
      };
    });

    // Dados históricos para gráfico de linha
    const trendData = [];

    // Verificar se existem tarefas no período filtrado
    const hasTasks = filteredTasks.length > 0;

    if (filterType === "month") {
      if (timeFilter === "all") {
        // Se não tiver mês específico, mostra generic week 1-4
        for (let i = 0; i < 4; i++) {
          trendData.push({
            name: `Week ${i + 1}`,
            completed: hasTasks ? statusCounts.DONE / 4 : 0,
            created: hasTasks ? filteredTasks.length / 4 : 0,
          });
        }
      } else if (timeFilter.match(/^\d{4}-\d{2}$/)) {
        // Se tiver um mês específico, mostrar as semanas reais desse mês
        const [year, month] = timeFilter.split("-").map(Number);
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);

        // Encontrar a primeira segunda-feira (mesmo que antes do início do mês)
        const firstMonday = new Date(firstDayOfMonth);
        const firstDayDay = firstDayOfMonth.getDay(); // 0 = domingo, 1 = segunda, etc
        const daysToMonday =
          firstDayDay === 0 ? 1 : firstDayDay === 1 ? 0 : 8 - firstDayDay;
        firstMonday.setDate(firstDayOfMonth.getDate() - daysToMonday);

        // Iterar por todas as segundas-feiras começando do firstMonday
        const weeksInMonth = [];
        const currentMonday = new Date(firstMonday);

        while (currentMonday <= lastDayOfMonth) {
          // Obter o número da semana ISO
          const weekNumber = format(currentMonday, "II");
          const weekYear = format(currentMonday, "yyyy");

          // Calcular o fim da semana (domingo)
          const weekEnd = new Date(currentMonday);
          weekEnd.setDate(currentMonday.getDate() + 6);

          weeksInMonth.push({
            date: new Date(currentMonday),
            label: `Week ${weekNumber}-${weekYear}`,
            startDate: new Date(currentMonday),
            endDate: weekEnd,
          });

          // Avançar para a próxima segunda-feira
          currentMonday.setDate(currentMonday.getDate() + 7);
        }

        // Usar as semanas encontradas para gerar dados baseados em tarefas reais
        if (hasTasks) {
          weeksInMonth.forEach((week) => {
            // Contar tarefas criadas nesta semana
            const tasksCreatedThisWeek = filteredTasks.filter((task) => {
              const taskDate = new Date(task.createdAt);
              return isWithinInterval(taskDate, {
                start: week.startDate,
                end: week.endDate,
              });
            });

            // Contar tarefas completadas nesta semana
            const tasksCompletedThisWeek = filteredTasks.filter((task) => {
              if (task.status !== "DONE" || !task.updatedAt) return false;
              const completedDate = new Date(task.updatedAt);
              return isWithinInterval(completedDate, {
                start: week.startDate,
                end: week.endDate,
              });
            });

            trendData.push({
              name: week.label,
              completed: tasksCompletedThisWeek.length,
              created: tasksCreatedThisWeek.length,
            });
          });
        } else {
          // Se não houver tarefas, adicionar semanas com valores zero
          weeksInMonth.forEach((week) => {
            trendData.push({
              name: week.label,
              completed: 0,
              created: 0,
            });
          });
        }
      }
    } else {
      // Modo de filtro por semana
      if (timeFilter.match(/^\d{4}-\d{2}$/)) {
        const [year, week] = timeFilter.split("-").map(Number);

        // Calcular o primeiro dia da semana ISO especificada
        const firstDayOfYear = new Date(year, 0, 1);
        const dayOfWeek = firstDayOfYear.getDay();
        const daysToFirstThursday =
          dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
        const firstThursday = new Date(firstDayOfYear);
        firstThursday.setDate(firstDayOfYear.getDate() + daysToFirstThursday);
        const firstISOWeekStart = new Date(firstThursday);
        firstISOWeekStart.setDate(firstThursday.getDate() - 3);

        // Move to target week
        const weekStart = new Date(firstISOWeekStart);
        weekStart.setDate(firstISOWeekStart.getDate() + (week - 1) * 7);

        // Gerar dias para esta semana
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        if (hasTasks) {
          // Contar tarefas para cada dia da semana
          const dayTaskCounts = days.map(() => ({ completed: 0, created: 0 }));

          // Distribuir tarefas existentes pelos dias da semana com base no dia da semana de createdAt
          filteredTasks.forEach((task) => {
            const taskDate = new Date(task.createdAt);
            // getDay() retorna 0 para domingo, 1 para segunda, etc.
            // Ajustar para o formato em que usamos (0 = segunda, 6 = domingo)
            const dayIndex =
              taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1;
            dayTaskCounts[dayIndex].created++;

            if (task.status === "DONE" && task.updatedAt) {
              const completedDate = new Date(task.updatedAt);
              const completedDayIndex =
                completedDate.getDay() === 0 ? 6 : completedDate.getDay() - 1;
              dayTaskCounts[completedDayIndex].completed++;
            }
          });

          // Criar dados do gráfico com contagens reais
          for (let i = 0; i < 7; i++) {
            trendData.push({
              name: days[i],
              completed: dayTaskCounts[i].completed,
              created: dayTaskCounts[i].created,
            });
          }
        } else {
          // Se não houver tarefas, mostrar dias com valores zero
          for (let i = 0; i < 7; i++) {
            trendData.push({
              name: days[i],
              completed: 0,
              created: 0,
            });
          }
        }
      } else {
        // Caso "all" para semanas, mostrar uma distribuição das tarefas pelos dias da semana
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        if (hasTasks) {
          // Contar tarefas para cada dia da semana
          const dayTaskCounts = days.map(() => ({ completed: 0, created: 0 }));

          // Distribuir tarefas existentes pelos dias da semana com base no dia da semana de createdAt
          filteredTasks.forEach((task) => {
            const taskDate = new Date(task.createdAt);
            // getDay() retorna 0 para domingo, 1 para segunda, etc.
            // Ajustar para o formato em que usamos (0 = segunda, 6 = domingo)
            const dayIndex =
              taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1;
            dayTaskCounts[dayIndex].created++;

            if (task.status === "DONE" && task.updatedAt) {
              const completedDate = new Date(task.updatedAt);
              const completedDayIndex =
                completedDate.getDay() === 0 ? 6 : completedDate.getDay() - 1;
              dayTaskCounts[completedDayIndex].completed++;
            }
          });

          // Criar dados do gráfico com contagens reais
          for (let i = 0; i < 7; i++) {
            trendData.push({
              name: days[i],
              completed: dayTaskCounts[i].completed,
              created: dayTaskCounts[i].created,
            });
          }
        } else {
          // Se não houver tarefas, mostrar dias com valores zero
          for (let i = 0; i < 7; i++) {
            trendData.push({
              name: days[i],
              completed: 0,
              created: 0,
            });
          }
        }
      }
    }

    return {
      statusDistribution,
      memberPerformanceData,
      trendData,
    };
  }, [
    statusCounts,
    memberPerformance,
    filteredTasks.length,
    filterType,
    timeFilter,
    filteredTasks,
  ]);

  // Add to the chartData useMemo calculation below the existing return statement
  const projectPerformanceData = useMemo(() => {
    if (!projects || !filteredTasks) return [];

    return projects
      .map((project) => {
        const projectTasks = filteredTasks.filter(
          (task) => task.projectId === project.id
        );

        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(
          (task) => task.status === "DONE"
        ).length;

        const inProgressTasks = projectTasks.filter(
          (task) => task.status === "IN_PROGRESS" || task.status === "IN_REVIEW"
        ).length;

        const completionRate =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calculate the nearest due date for this project
        const incompleteTasks = projectTasks.filter(
          (task) => task.status !== "DONE" && task.status !== "DROPPED"
        );

        let nearestDueDate = null;

        if (incompleteTasks.length > 0) {
          nearestDueDate = incompleteTasks
            .filter((task) => task.dueDate)
            .sort((a, b) => {
              const dateA = new Date(a.dueDate);
              const dateB = new Date(b.dueDate);
              return dateA.getTime() - dateB.getTime();
            })[0]?.dueDate;
        }

        return {
          id: project.id,
          name: project.name,
          totalTasks,
          completedTasks,
          inProgressTasks,
          completionRate,
          nearestDueDate,
          overdueTasks: projectTasks.filter(
            (task) =>
              task.status !== "DONE" &&
              task.dueDate &&
              isPast(new Date(task.dueDate))
          ).length,
        };
      })
      .sort((a, b) => b.totalTasks - a.totalTasks);
  }, [projects, filteredTasks]);

  // Inside the WorkspaceIdClient component, add a new state for expanded projects view
  const [expandedProjects, setExpandedProjects] = useState(false);

  // Loading and error states
  if (isLoading) {
    return <PageLoader />;
  }

  if (!analytics || !tasks || !projects || !members) {
    return <PageError message="Failed to load workspace data" />;
  }

  // Render component
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={filterType === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterTypeChange("month")}
            >
              Month
            </Button>
            <Button
              variant={filterType === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterTypeChange("week")}
            >
              Week
            </Button>
          </div>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue>
                {timeFilter === "all"
                  ? "All periods"
                  : filterType === "month"
                    ? monthOptions.find((opt) => opt.value === timeFilter)
                        ?.label || "Filter by period"
                    : weekOptions.find((opt) => opt.value === timeFilter)
                        ?.label || "Filter by period"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All periods</SelectItem>
              <SelectGroup>
                {filterType === "month" ? (
                  <>
                    <SelectLabel>Months</SelectLabel>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <>
                    <SelectLabel>Weeks</SelectLabel>
                    {weekOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-3 ${metrics.trend >= 0 ? "bg-green-100" : "bg-red-100"}`}
              >
                {metrics.trend >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Task Trend
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{metrics.currentTotal}</h3>
                  <span
                    className={`text-xs ${metrics.trend >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {metrics.trend.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  vs previous period ({metrics.previousTotal})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-blue-100">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Completion Time
                </p>
                <h3 className="text-2xl font-bold">
                  {metrics.averageCompletionTime.toFixed(1)}{" "}
                  <span className="text-sm">days</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  business days to complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  At Risk
                </p>
                <h3 className="text-2xl font-bold">{metrics.atRiskTasks}</h3>
                <p className="text-xs text-muted-foreground">
                  tasks due in next 2 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <h3 className="text-2xl font-bold">{metrics.overdueTasks}</h3>
                <p className="text-xs text-muted-foreground">
                  tasks past due date
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatusCard
          title="BACKLOG"
          value={statusCounts.BACKLOG}
          color="bg-pink-600"
          icon={<Archive className="h-5 w-5 text-white" />}
        />
        <StatusCard
          title="TODO"
          value={statusCounts.TODO}
          color="bg-blue-500"
          icon={<ListTodo className="h-5 w-5 text-white" />}
        />
        <StatusCard
          title="IN PROGRESS"
          value={statusCounts.IN_PROGRESS}
          color="bg-yellow-500"
          icon={<PlayCircle className="h-5 w-5 text-white" />}
        />
        <StatusCard
          title="IN REVIEW"
          value={statusCounts.IN_REVIEW}
          color="bg-purple-500"
          icon={<FileSearch className="h-5 w-5 text-white" />}
        />
        <StatusCard
          title="DONE"
          value={statusCounts.DONE}
          color="bg-emerald-500"
          icon={<CheckSquare className="h-5 w-5 text-white" />}
        />
        <StatusCard
          title="DROPPED"
          value={statusCounts.DROPPED}
          color="bg-gray-600"
          icon={<XCircle className="h-5 w-5 text-white" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-muted-foreground" />
              <span>Task Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {React.createElement(
                AreaChart as ComponentType<any>,
                { data: chartData.trendData },
                <defs key="defs">
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>,
                <CartesianGrid
                  key="grid"
                  strokeDasharray="3 3"
                  stroke={isDark ? "#374151" : "#e5e7eb"}
                  vertical={false}
                />,
                <XAxis
                  key="xAxis"
                  dataKey="name"
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y + 10})`}>
                        <text
                          x={0}
                          y={0}
                          dy={0}
                          textAnchor="end"
                          fill={isDark ? "#9ca3af" : "#4b5563"}
                          fontSize={12}
                          transform="rotate(-45)"
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                  height={60}
                  axisLine={{ stroke: isDark ? "#374151" : "#e5e7eb" }}
                />,
                <YAxis
                  key="yAxis"
                  tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
                  axisLine={{ stroke: isDark ? "#374151" : "#e5e7eb" }}
                />,
                <RechartTooltip key="tooltip" content={<CustomTooltip />} />,
                <Legend
                  key="legend"
                  wrapperStyle={{
                    paddingTop: "10px",
                    color: isDark ? "#d1d5db" : "#1f2937",
                  }}
                />,
                <Area
                  key="areaCreated"
                  type="monotone"
                  dataKey="created"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                  name="Created"
                />,
                <Area
                  key="areaCompleted"
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Completed"
                />
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <span>Task Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center h-80">
            <ResponsiveContainer width="100%" height="100%">
              {React.createElement(
                PieChart as ComponentType<any>,
                {},
                <Pie
                  key="pie"
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>,
                <RechartTooltip key="tooltip" content={<CustomTooltip />} />,
                <Legend
                  key="legend"
                  formatter={(value, entry) => (
                    <span style={{ color: isDark ? "#d1d5db" : "#1f2937" }}>
                      {value}
                    </span>
                  )}
                />
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Member Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-muted-foreground" />
              <span>Team Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {React.createElement(
                BarChart as ComponentType<any>,
                { data: chartData.memberPerformanceData },
                <CartesianGrid
                  key="grid"
                  strokeDasharray="3 3"
                  stroke={isDark ? "#374151" : "#e5e7eb"}
                  vertical={false}
                />,
                <XAxis
                  key="xAxis"
                  dataKey="name"
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y + 10})`}>
                        <text
                          x={0}
                          y={0}
                          dy={0}
                          textAnchor="end"
                          fill={isDark ? "#9ca3af" : "#4b5563"}
                          fontSize={12}
                          transform="rotate(-45)"
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                  height={60}
                  axisLine={{ stroke: isDark ? "#374151" : "#e5e7eb" }}
                />,
                <YAxis
                  key="yAxis"
                  tick={{ fill: isDark ? "#9ca3af" : "#4b5563" }}
                  axisLine={{ stroke: isDark ? "#374151" : "#e5e7eb" }}
                />,
                <RechartTooltip key="tooltip" content={<CustomTooltip />} />,
                <Legend
                  key="legend"
                  wrapperStyle={{
                    paddingTop: "10px",
                    color: isDark ? "#d1d5db" : "#1f2937",
                  }}
                />,
                <Bar
                  key="bar-assigned"
                  dataKey="assigned"
                  fill="#3b82f6"
                  name="Assigned Tasks"
                  radius={[4, 4, 0, 0]}
                />,
                <Bar
                  key="bar-completed"
                  dataKey="completed"
                  fill="#10b981"
                  name="Completed Tasks"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Overview Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span>Project Overview</span>
          </CardTitle>
          <CardDescription>
            Status and performance of active projects
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <div className="overflow-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Project</th>
                  <th className="text-center p-2 font-medium">Tasks</th>
                  <th className="text-center p-2 font-medium">Progress</th>
                  <th className="text-center p-2 font-medium">Completion</th>
                  <th className="text-center p-2 font-medium">Next Due</th>
                  <th className="text-center p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectPerformanceData
                  .slice(
                    0,
                    expandedProjects ? projectPerformanceData.length : 5
                  )
                  .map((project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/20">
                      <td className="p-2">
                        <Link
                          href={`/jira/workspaces/${workspaceId}/projects/${project.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <ProjectAvatar
                              className="h-8 w-8"
                              name={project.name}
                            />
                            <span className="font-medium">{project.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="text-center p-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {project.totalTasks}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {project.completedTasks} completed
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${project.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {project.completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium
                          ${
                            project.completionRate >= 75
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : project.completionRate >= 50
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : project.completionRate >= 25
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {project.completionRate >= 75
                            ? "On Track"
                            : project.completionRate >= 50
                              ? "Good Progress"
                              : project.completionRate >= 25
                                ? "Needs Attention"
                                : "At Risk"}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        {project.nearestDueDate ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(
                                new Date(project.nearestDueDate),
                                "MMM dd"
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(project.nearestDueDate),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            None
                          </span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        {project.overdueTasks > 0 ? (
                          <span className="text-red-500 flex items-center gap-1 justify-center">
                            <AlertCircle className="h-4 w-4" />
                            <span>{project.overdueTasks} overdue</span>
                          </span>
                        ) : (
                          <span className="text-green-500 flex items-center gap-1 justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>On schedule</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                {projectPerformanceData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {projectPerformanceData.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setExpandedProjects(!expandedProjects)}
                className="transition-all duration-200"
              >
                {expandedProjects ? (
                  <>
                    Show Less <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All Projects ({projectPerformanceData.length}){" "}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span>Top Performers</span>
            </CardTitle>
            <CardDescription>
              Based on task completion volume and efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberPerformance
                .filter((member) => member.assignedCount > 0)
                // Create a weighted score that balances completion count and rate
                // This prevents people with just 1-2 tasks from dominating solely due to 100% completion
                .map((member) => ({
                  ...member,
                  // Weight: 70% for number of completed tasks, 30% for completion rate
                  // Normalize against the max values in the dataset
                  weightedScore:
                    member.assignedCount >= 3
                      ? 0.7 * member.completedCount +
                        0.3 * member.completionRate
                      : 0.3 * member.completedCount +
                        0.1 * member.completionRate, // Lower weight for members with few tasks
                }))
                .sort((a, b) => b.weightedScore - a.weightedScore)
                .slice(0, 3)
                .map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <MemberAvatar className="h-10 w-10" name={member.name} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm font-medium">
                          {member.completionRate.toFixed(0)}% completion
                        </p>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full mt-1">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${member.completionRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {member.completedCount} of {member.assignedCount}{" "}
                          tasks completed
                        </p>
                        {member.assignedCount >= 3 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            High volume
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {member.completedCount} completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {memberPerformance.filter((member) => member.assignedCount > 0)
                .length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span>Productivity Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {metrics.completionRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {statusCounts.DONE} of {filteredTasks.length} tasks completed
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="rounded-full p-2 bg-amber-100 text-amber-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">On-Time Delivery</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {filteredTasks.filter(
                    (task) =>
                      task.status === "DONE" &&
                      task.dueDate &&
                      !isPast(new Date(task.dueDate))
                  ).length > 0 && statusCounts.DONE > 0
                    ? (
                        (filteredTasks.filter(
                          (task) =>
                            task.status === "DONE" &&
                            task.dueDate &&
                            !isPast(new Date(task.dueDate))
                        ).length /
                          statusCounts.DONE) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </p>
                <p className="text-xs text-muted-foreground">
                  Tasks completed before deadline
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="rounded-full p-2 bg-green-100 text-green-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Time to Complete</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {metrics.averageCompletionTime.toFixed(1)}{" "}
                  <span className="text-sm font-normal">days</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Average business days to finish
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="rounded-full p-2 bg-purple-100 text-purple-600">
                    <Flag className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Task Distribution</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {(
                    filteredTasks.length /
                    Math.max(
                      memberPerformance.filter((m) => m.assignedCount > 0)
                        .length,
                      1
                    )
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Average tasks per active member
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks and Projects Section */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="issues">
            Issues ({metrics.overdueTasks + metrics.blockedTasks})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="py-4">
          <TaskList
            data={tasks.documents.map((task) => ({
              ...task,
              assignee: {
                ...task.assignee,
                updatedAt: task.assignee.createdAt,
              },
              fileUrl: task.fileUrl,
            }))}
            total={tasks.total}
          />
        </TabsContent>
        <TabsContent value="projects" className="py-4">
          <ProjectList data={projects} total={projects.length} />
        </TabsContent>
        <TabsContent value="members" className="py-4">
          <MembersList data={members.documents} total={members.total} />
        </TabsContent>
        <TabsContent value="issues" className="py-4">
          <div className="w-full flex flex-col gap-y-4 col-span-1">
            <div className="bg-card dark:bg-card rounded-lg p-4 border dark:border-border">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground dark:text-foreground">
                  Issues ({metrics.overdueTasks + metrics.blockedTasks})
                </p>
              </div>
              <DottedSeparator className="my-4" />
              <ul className="space-y-4">
                {filteredTasks
                  .filter(
                    (task) =>
                      (task.status !== "DONE" &&
                        task.dueDate &&
                        isPast(new Date(task.dueDate)) &&
                        !isToday(new Date(task.dueDate))) ||
                      (task.status === "IN_PROGRESS" &&
                        task.updatedAt &&
                        differenceInDays(new Date(), new Date(task.updatedAt)) >
                          5)
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <li key={task.id} className="p-4 border rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.project?.name} • {task.status}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm ${
                            task.status !== "DONE" &&
                            task.dueDate &&
                            isPast(new Date(task.dueDate))
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                          }`}
                        >
                          {task.status !== "DONE" &&
                          task.dueDate &&
                          isPast(new Date(task.dueDate)) ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>Overdue</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Blocked</span>
                            </>
                          )}
                        </div>
                      </div>
                      {task.assignee && (
                        <div className="flex items-center mt-2">
                          <MemberAvatar
                            className="h-6 w-6 mr-2"
                            name={task.assignee.name}
                          />
                          <span className="text-sm">{task.assignee.name}</span>
                        </div>
                      )}
                    </li>
                  ))}
                {metrics.overdueTasks + metrics.blockedTasks === 0 && (
                  <li className="text-center text-muted-foreground py-4">
                    No issues found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple status card component
interface StatusCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const StatusCard = ({ title, value, color, icon }: StatusCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`rounded-full p-2 ${color}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

interface TaskListProps {
  data: Task[];
  total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  return (
    <div className="w-full flex flex-col gap-y-4 col-span-1">
      <div className="bg-card dark:bg-card rounded-lg p-4 border dark:border-border">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-foreground dark:text-foreground">
            Tasks ({total})
          </p>
          <Button variant="secondary" size="icon" onClick={createTask}>
            <PlusIcon className="size-4 text-muted-foreground dark:text-muted-foreground" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.slice(0, 3).map((task) => (
            <li key={task.id}>
              <Link href={`/jira/workspaces/${workspaceId}/tasks/${task.id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition bg-card dark:bg-card w-full">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium truncate text-foreground dark:text-foreground">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-x-2">
                      <p className="text-foreground dark:text-foreground">
                        {task.project?.name}
                      </p>
                      <div className="size-1 rounded-full bg-muted-foreground/30 dark:bg-muted-foreground/30" />
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground flex items-center">
                        <CalendarIcon className="size-3 mr-1" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground dark:text-muted-foreground text-center hidden first-of-type:block">
            No tasks found
          </li>
        </ul>
        <Button variant="secondary" className="mt-4 w-full" asChild>
          <Link href={`/jira/workspaces/${workspaceId}/tasks`}>Show All</Link>
        </Button>
      </div>
    </div>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="w-full flex flex-col gap-y-4 col-span-1">
      <div className="bg-card dark:bg-card rounded-lg p-4 border dark:border-border">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-foreground dark:text-foreground">
            Projects ({total})
          </p>
          <Button variant="secondary" size="icon" onClick={createProject}>
            <PlusIcon className="size-4 text-muted-foreground dark:text-muted-foreground" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((project) => (
            <li key={project.id}>
              <Link
                href={`/jira/workspaces/${workspaceId}/projects/${project.id}`}
              >
                <Card className="shadow-none rounded-lg hover:opacity-75 transition bg-card dark:bg-card">
                  <CardContent className="p-4 flex items-center gap-x-2.5">
                    <ProjectAvatar
                      className="size-12"
                      fallbackClassName="text-lg"
                      name={project.name}
                      image={project.imageUrl ?? undefined}
                    />
                    <p className="text-md truncate text-foreground dark:text-foreground">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground dark:text-muted-foreground text-center hidden first-of-type:block">
            No projects found
          </li>
        </ul>
      </div>
    </div>
  );
};

interface MembersListProps {
  data: Member[];
  total: number;
}

export const MembersList = ({ data, total }: MembersListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="w-full flex flex-col gap-y-4 col-span-1">
      <div className="bg-card dark:bg-card rounded-lg p-4 border dark:border-border">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-foreground dark:text-foreground">
            Members ({total})
          </p>
          <Button asChild variant="secondary" size="icon">
            <Link href={`/jira/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-muted-foreground dark:text-muted-foreground" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((member) => (
            <li key={member.id}>
              <Card className="shadow-none rounded-lg overflow-hidden bg-card dark:bg-card">
                <CardContent className="p-3 flex flex-col items-center gap-x-2">
                  <MemberAvatar className="size-12" name={member.name} />
                  <div className="flex flex-col items-center overflow-hidden">
                    <p className="text-md line-clamp-1 text-foreground dark:text-foreground">
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-1">
                      {member.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className="text-sm text-muted-foreground dark:text-muted-foreground text-center hidden first-of-type:block">
            No members found
          </li>
        </ul>
      </div>
    </div>
  );
};
