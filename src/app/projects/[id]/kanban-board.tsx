"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { QuickAddTask } from "./quick-add-task";
import { useKanban } from "./kanban-context";
import { TaskFilters } from "./task-filters";

const statusColumns: { id: Task["task_status"]; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-gray-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
  { id: "DONE", title: "Done", color: "bg-green-500" },
  { id: "BLOCKED", title: "Blocked", color: "bg-red-500" },
];

export function KanbanBoard({ projectId, currentUser }: { projectId: number; currentUser: any }) {
  const { state, moveTask, fetchTasks } = useKanban();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL" as Task["task_status"] | "ALL",
    priority: "ALL" as Task["task_priority"] | "ALL",
  });

  useEffect(() => {
    fetchTasks(projectId);
  }, [projectId]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Filter tasks based on search, status, and priority
  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.task_title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          (task.task_description && task.task_description.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = filters.status === "ALL" || task.task_status === filters.status;
    const matchesPriority = filters.priority === "ALL" || task.task_priority === filters.priority;
    
    return task.project_id === projectId && matchesSearch && matchesStatus && matchesPriority;
  });

  const tasksByStatus = statusColumns.map((column) => ({
    ...column,
    tasks: filteredTasks.filter(task => task.task_status === column.id),
  }));

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task["task_status"]) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    moveTask(taskId, newStatus);
  };

  // Check if user can add tasks (PM or ADMIN)
  const canAddTasks = currentUser?.role === "PM" || currentUser?.role === "ADMIN";

  if (state.loading) {
    return <div>Loading tasks...</div>;
  }

  if (state.error) {
    return <div className="text-red-500">Error: {state.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Tasks</h2>
        <Button onClick={() => {
          console.log("Current user role:", currentUser?.role);
          if (canAddTasks) {
            setShowQuickAdd(true);
          } else {
            alert(`Anda login sebagai ${currentUser?.role || 'Unknown'}. Hanya Project Manager atau Admin yang dapat menambah task.`);
          }
        }}>
          Add Task
        </Button>
      </div>

      <TaskFilters onFilterChange={handleFilterChange} />

      {showQuickAdd && (
        <QuickAddTask 
          projectId={projectId} 
          onClose={() => setShowQuickAdd(false)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tasksByStatus.map((column) => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${column.color} mr-2`}></div>
                <h3 className="font-semibold">{column.title}</h3>
                <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 min-h-[100px]">
              {column.tasks.map((task) => (
                <TaskCard 
                  key={task.task_id} 
                  task={task} 
                  onDragStart={handleDragStart}
                />
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}