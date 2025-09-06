"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";
import { useKanban } from "./kanban-context";
import { EditTaskModal } from "./edit-task-modal";

const priorityColors = {
  LOW: "bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20",
  URGENT: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20",
};

export function TaskCard({ 
  task, 
  onDragStart,
  currentUser
}: { 
  task: Task; 
  onDragStart: (e: React.DragEvent, taskId: number) => void;
  currentUser: any;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { deleteTask, updateTask } = useKanban();
  
  // Check if user can interact with task (assigned user, PM, or ADMIN)
  const canInteractWithTask = task.assignee_user_id === currentUser?.id || 
                             currentUser?.role === "PM" || 
                             currentUser?.role === "ADMIN";

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Task yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(task.task_id);
        Swal.fire({
          title: "Dihapus!",
          text: "Task telah berhasil dihapus.",
          icon: "success"
        });
      } catch (error) {
        console.error("Failed to delete task:", error);
        Swal.fire({
          title: "Gagal!",
          text: "Gagal menghapus task.",
          icon: "error"
        });
      }
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Gagal mengupdate task");
    }
  };

  return (
    <>
      <div 
        className={`bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-sky-500 transition group ${canInteractWithTask ? 'cursor-move' : 'cursor-not-allowed opacity-75'}`}
        draggable={canInteractWithTask}
        onDragStart={(e) => canInteractWithTask && onDragStart(e, task.task_id)}
        onClick={() => setShowDetails(true)}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-slate-100 group-hover:text-sky-400">{task.task_title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-500 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Lihat Detail</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Hapus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {task.task_description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            {task.task_description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <Badge 
            className={priorityColors[task.task_priority]}
          >
            {task.task_priority === "LOW" && "Rendah"}
            {task.task_priority === "MEDIUM" && "Sedang"}
            {task.task_priority === "HIGH" && "Tinggi"}
            {task.task_priority === "URGENT" && "Urgent"}
          </Badge>
          
          <div className="flex items-center gap-2">
            {task.task_due_date && (
              <span className="text-xs text-slate-400">
                {new Date(task.task_due_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            )}
            {task.assignee_user_id && (
              <div className="h-6 w-6 rounded-full bg-sky-500 flex items-center justify-center text-xs text-white">
                U
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{task.task_title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {task.task_description && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm text-slate-400">Deskripsi</span>
                <span className="col-span-3 text-sm text-slate-300">{task.task_description}</span>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm text-slate-400">Status</span>
              <span className="col-span-3">
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {task.task_status === "TODO" && "To Do"}
                  {task.task_status === "IN_PROGRESS" && "In Progress"}
                  {task.task_status === "DONE" && "Done"}
                  {task.task_status === "BLOCKED" && "Blocked"}
                </Badge>
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm text-slate-400">Prioritas</span>
              <span className="col-span-3">
                <Badge className={priorityColors[task.task_priority]}>
                  {task.task_priority === "LOW" && "Rendah"}
                  {task.task_priority === "MEDIUM" && "Sedang"}
                  {task.task_priority === "HIGH" && "Tinggi"}
                  {task.task_priority === "URGENT" && "Urgent"}
                </Badge>
              </span>
            </div>
            {task.task_due_date && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm text-slate-400">Tenggat Waktu</span>
                <span className="col-span-3 text-sm text-slate-300">
                  {new Date(task.task_due_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm text-slate-400">Progress</span>
              <span className="col-span-3 text-sm text-slate-300">{task.task_progress}%</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditTaskModal
        task={task}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUpdateTask={handleUpdateTask}
      />
    </>
  );
}