"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { QuickAddTask } from "./quick-add-task";
import { useKanban } from "./kanban-context";
import { TaskFilters } from "./task-filters";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Konfigurasi kolom status untuk board Kanban
 * Mendefinisikan struktur dan warna untuk setiap kolom status
 */
const statusColumns: { id: Task["task_status"]; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-sky-400" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-yellow-400" },
  { id: "DONE", title: "Done", color: "bg-green-400" },
  { id: "BLOCKED", title: "Blocked", color: "bg-red-500" },
];

/**
 * Komponen board Kanban untuk manajemen tugas proyek
 * Menampilkan tugas dalam format kolom berdasarkan status dengan kemampuan drag-and-drop
 * 
 * @param projectId - ID proyek yang ditampilkan
 * @param currentUser - Data pengguna yang sedang login
 * @returns Board Kanban interaktif dengan tugas-tugas proyek
 */
export function KanbanBoard({ projectId, currentUser }: { projectId: number; currentUser: any }) {
  const { state, moveTask, fetchTasks } = useKanban();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL" as Task["task_status"] | "ALL",
    priority: "ALL" as Task["task_priority"] | "ALL",
  });

  // Mengambil tugas ketika projectId berubah
  useEffect(() => {
    fetchTasks(projectId);
  }, [projectId]);

  /**
   * Handler untuk perubahan filter
   * Memperbarui state filter berdasarkan input pengguna
   * 
   * @param newFilters - Filter baru yang diterapkan
   */
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Memfilter tugas berdasarkan search, status, dan priority
  const filteredTasks = state.tasks.filter(task => {
    const matchesSearch = task.task_title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          (task.task_description && task.task_description.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = filters.status === "ALL" || task.task_status === filters.status;
    const matchesPriority = filters.priority === "ALL" || task.task_priority === filters.priority;
    
    return task.project_id === projectId && matchesSearch && matchesStatus && matchesPriority;
  });

  /**
   * Mengelompokkan tugas berdasarkan status untuk ditampilkan di kolom yang sesuai
   */
  const tasksByStatus = statusColumns.map((column) => ({
    ...column,
    tasks: filteredTasks.filter(task => task.task_status === column.id),
  }));

  /**
   * Handler untuk event drag start
   * Menyimpan ID tugas yang sedang di-drag ke data transfer
   * 
   * @param e - Event drag start
   * @param taskId - ID tugas yang di-drag
   */
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  /**
   * Handler untuk event drag over
   * Mencegah perilaku default untuk memungkinkan drop
   * 
   * @param e - Event drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  /**
   * Handler untuk event drop
   * Memindahkan tugas ke kolom status baru
   * 
   * @param e - Event drop
   * @param newStatus - Status baru untuk tugas
   */
  const handleDrop = (e: React.DragEvent, newStatus: Task["task_status"]) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    moveTask(taskId, newStatus);
  };

  // Memeriksa apakah pengguna dapat menambahkan tugas (PM atau ADMIN)
  const canAddTasks = currentUser?.role === "PM" || currentUser?.role === "ADMIN";

  // Menampilkan indikator loading atau pesan error jika diperlukan
  if (state.loading) {
    return <div className="text-slate-400">Memuat tugas...</div>;
  }

  if (state.error) {
    return <div className="text-red-400 text-sm">Error: {state.error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls: Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari tugas..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange({ ...filters, search: e.target.value });
            }}
          />
        </div>
        <Button 
          variant="outline" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        {canAddTasks && (
          <Button 
            onClick={() => setShowQuickAdd(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Tugas
          </Button>
        )}
      </div>

      {showFilters && (
        <TaskFilters onFilterChange={handleFilterChange} />
      )}

      {showQuickAdd && (
        <QuickAddTask 
          projectId={projectId} 
          onClose={() => setShowQuickAdd(false)} 
        />
      )}

      {/* Kanban Board */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {tasksByStatus.map((column) => (
          <div
            key={column.id}
            className="kanban-column bg-slate-900/50 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${column.color}`}></span>
                <h3 className="font-semibold text-white">{column.title}</h3>
              </div>
              <span className="text-sm font-medium bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <div className="space-y-4">
              {column.tasks.map((task) => (
                <TaskCard 
                  key={task.task_id} 
                  task={task} 
                  onDragStart={handleDragStart}
                  currentUser={currentUser}
                />
              ))}
              
              {column.tasks.length === 0 && (
                <div className="space-y-4 text-center py-10 border-2 border-dashed border-slate-800 rounded-lg">
                  <p className="text-sm text-slate-500">Tidak ada tugas.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}