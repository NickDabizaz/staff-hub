"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useKanban } from "./kanban-context";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuickAddTask({ 
  projectId, 
  onClose 
}: { 
  projectId: number; 
  onClose: () => void;
}) {
  const { addTask } = useKanban();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Task["task_priority"]>("MEDIUM");
  const [status, setStatus] = useState<Task["task_status"]>("TODO");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    
    try {
      await addTask({
        project_id: projectId,
        // We'll set team_id to null and let the backend determine the appropriate team
        // or we can fetch the first team associated with this project
        team_id: null, // Will be set by backend or we'll fetch it
        assignee_user_id: null,
        task_title: title,
        task_description: description,
        task_status: status,
        task_priority: priority,
        task_due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
        task_progress: progress,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setPriority("MEDIUM");
      setStatus("TODO");
      setProgress(0);
      onClose();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Tambah Tugas Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">
                Judul
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Design the login page"
                className="w-full bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan deskripsi singkat..."
                className="w-full bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-300">
                  Status
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Task["task_status"])}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-slate-300">
                  Prioritas
                </Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as Task["task_priority"])}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Pilih prioritas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="LOW">Rendah</SelectItem>
                    <SelectItem value="MEDIUM">Sedang</SelectItem>
                    <SelectItem value="HIGH">Tinggi</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-slate-300">
                  Tenggat Waktu
                </Label>
                <DatePicker 
                  date={dueDate} 
                  onDateChange={setDueDate} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="progress" className="text-slate-300">
                  Progress (%)
                </Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="bg-slate-800/50 border-t border-slate-800 rounded-b-lg">
            <Button type="button" variant="outline" onClick={onClose} className="text-slate-300 bg-transparent hover:bg-slate-700">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-500">
              {isLoading ? "Menambahkan..." : "Buat Tugas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}