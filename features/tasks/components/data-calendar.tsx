import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import React, { ComponentType } from "react";

import { Button } from "@/components/ui/button";

import { EventCard } from "@/features/tasks/components/event-card";

import { Task, TaskStatus } from "@/features/tasks/types";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/features/tasks/components/data-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Cast Calendar to a component type to fix TypeScript error
const CalendarComponent = Calendar as ComponentType<any>;

interface DataCalendarProps {
  data: Task[];
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
      <Button onClick={() => onNavigate("TODAY")} variant="secondary" size="sm">
        Today
      </Button>
    </div>
  );
};

// Define interface for event type
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  project: any;
  assignee: any;
  status: keyof typeof TaskStatus;
}

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task.id,
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };

  return (
    <CalendarComponent
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView="month"
      toolbar
      showAllEvents
      className="h-full"
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date: Date, culture: string, localizer: any) =>
          localizer?.format(date, "EEE", culture) ?? "",
      }}
      dayPropGetter={(date: Date) => {
        if (isToday(date)) {
          return {
            style: {
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              color: "#2563eb",
            },
          };
        }
        return {};
      }}
      components={{
        eventWrapper: ({ event }: { event: CalendarEvent }) => (
          <EventCard
            id={event.id}
            title={event.title}
            assignee={event.assignee}
            project={event.project}
            status={event.status}
          />
        ),
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate} />
        ),
      }}
    />
  );
};
