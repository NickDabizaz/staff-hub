"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Task } from "@/types";

export function TaskFilters({ 
  onFilterChange 
}: { 
  onFilterChange: (filters: {
    search: string;
    status: Task["task_status"] | "ALL";
    priority: Task["task_priority"] | "ALL";
  }) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Task["task_status"] | "ALL">("ALL");
  const [priority, setPriority] = useState<Task["task_priority"] | "ALL">("ALL");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status, priority });
  };

  const handleStatusChange = (value: Task["task_status"] | "ALL") => {
    setStatus(value);
    onFilterChange({ search, status: value, priority });
  };

  const handlePriorityChange = (value: Task["task_priority"] | "ALL") => {
    setPriority(value);
    onFilterChange({ search, status, priority: value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}