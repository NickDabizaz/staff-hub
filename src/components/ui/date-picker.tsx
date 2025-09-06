"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date,
  onDateChange,
  className,
}: {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 hover:bg-slate-700 text-white",
            !date && "text-slate-400",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: id })
          ) : (
            <span>Pilih tanggal</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-slate-800 border-slate-700 rounded-lg shadow-lg"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="bg-slate-800 border-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-white",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-slate-700 hover:bg-slate-600 text-white rounded-md",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-700/50 [&:has([aria-selected])]:bg-sky-600 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-slate-700 rounded-md",
            day_range_end: "day-range-end",
            day_selected: "bg-sky-600 text-white hover:bg-sky-500 focus:bg-sky-500",
            day_today: "bg-slate-700 text-white",
            day_outside: "text-slate-500 opacity-50 aria-selected:bg-slate-700/50 aria-selected:text-slate-500 aria-selected:opacity-30",
            day_disabled: "text-slate-500 opacity-50",
            day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-white",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}