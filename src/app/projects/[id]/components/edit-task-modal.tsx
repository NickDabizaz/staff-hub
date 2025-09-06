"use client";

import React, { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";

interface EditTaskModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (task: Task) => Promise<void>;
}

const priorityOptions = [
  { value: "LOW", label: "Rendah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HIGH", label: "Tinggi" },
  { value: "URGENT", label: "Urgent" },
];

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
];

export function EditTaskModal({ task, open, onOpenChange, onUpdateTask }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.task_title);
  const [description, setDescription] = useState(task.task_description || "");
  const [status, setStatus] = useState<Task["task_status"]>(task.task_status);
  const [priority, setPriority] = useState<Task["task_priority"]>(task.task_priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.task_due_date ? parseISO(task.task_due_date) : undefined
  );
  const [progress, setProgress] = useState(task.task_progress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(task.task_title);
      setDescription(task.task_description || "");
      setStatus(task.task_status);
      setPriority(task.task_priority);
      setDueDate(task.task_due_date ? parseISO(task.task_due_date) : undefined);
      setProgress(task.task_progress);
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedTask: Task = {
        ...task,
        task_title: title,
        task_description: description || null,
        task_status: status,
        task_priority: priority,
        task_due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        task_progress: progress,
      };

      await onUpdateTask(updatedTask);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Tugas</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Judul</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-300">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Task["task_status"])}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-300">Prioritas</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Task["task_priority"])}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-slate-300">Tenggat Waktu</Label>
            <DatePicker date={dueDate} onDateChange={setDueDate} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress" className="text-slate-300">Progress (%)</Label>
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

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2 bg-slate-800/50 border-t border-slate-800 rounded-b-lg p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-slate-300 bg-transparent hover:bg-slate-700"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-500">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}