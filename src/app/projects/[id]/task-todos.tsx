"use client";

import React, { useState, useEffect } from "react";
import { TaskTodo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus } from "lucide-react";
import { 
  getTaskTodosAction,
  addTaskTodoAction,
  editTaskTodoAction,
  deleteTaskTodoAction,
  updateTaskTodoStatusAction
} from "./task-todos/actions";
import Swal from "sweetalert2";

const statusColors: Record<string, string> = {
  TODO: "bg-gray-500",
  DOING: "bg-blue-500",
  DONE: "bg-green-500",
};

export function TaskTodos({ taskId }: { taskId: number }) {
  const [todos, setTodos] = useState<TaskTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<TaskTodo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch todos for the task
  useEffect(() => {
    fetchTodos();
  }, [taskId]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTaskTodosAction(taskId);
      setTodos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (todo: TaskTodo) => {
    setCurrentTodo(todo);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (todoId: number) => {
    // Menggunakan SweetAlert untuk konfirmasi hapus
    const result = await Swal.fire({
      title: "Hapus Todo?",
      text: "Apakah Anda yakin ingin menghapus todo ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280"
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("task_todo_id", todoId.toString());
      formData.append("task_id", taskId.toString());
      
      await deleteTaskTodoAction(formData);
      
      setTodos(todos.filter(todo => todo.task_todo_id !== todoId));
      
      await Swal.fire({
        title: "Berhasil!",
        text: "Todo berhasil dihapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Gagal menghapus todo",
        icon: "error"
      });
    }
  };

  const handleAdd = () => {
    setCurrentTodo({
      task_todo_id: 0,
      task_id: taskId,
      assignee_user_id: null,
      task_todo_title: "",
      task_todo_status: "TODO",
      task_todo_evidence: null,
      task_todo_due_date: null
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTodo) return;

    try {
      const formData = new FormData();
      formData.append("task_id", currentTodo.task_id.toString());
      formData.append("task_todo_title", currentTodo.task_todo_title);
      formData.append("task_todo_status", currentTodo.task_todo_status);
      
      if (currentTodo.task_todo_id) {
        formData.append("task_todo_id", currentTodo.task_todo_id.toString());
      }
      
      if (currentTodo.assignee_user_id) {
        formData.append("assignee_user_id", currentTodo.assignee_user_id.toString());
      }
      
      if (currentTodo.task_todo_evidence) {
        formData.append("task_todo_evidence", currentTodo.task_todo_evidence);
      }
      
      if (currentTodo.task_todo_due_date) {
        formData.append("task_todo_due_date", currentTodo.task_todo_due_date);
      }

      let result: TaskTodo;
      
      if (isEditing) {
        // Edit existing todo
        result = await editTaskTodoAction(formData);
      } else {
        // Add new todo
        result = await addTaskTodoAction(formData);
      }

      if (result) {
        if (isEditing) {
          setTodos(todos.map(todo => 
            todo.task_todo_id === result.task_todo_id ? result : todo
          ));
        } else {
          setTodos([...todos, result]);
        }
        setIsDialogOpen(false);
        
        await Swal.fire({
          title: "Berhasil!",
          text: `Todo berhasil ${isEditing ? "diupdate" : "ditambahkan"}`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err: any) {
      await Swal.fire({
        title: "Error!",
        text: err.message || `Gagal ${isEditing ? "mengupdate" : "menambahkan"} todo`,
        icon: "error"
      });
    }
  };

  const handleStatusChange = async (todoId: number, status: TaskTodo["task_todo_status"]) => {
    try {
      const formData = new FormData();
      formData.append("task_todo_id", todoId.toString());
      formData.append("task_id", taskId.toString());
      formData.append("status", status);
      
      const result = await updateTaskTodoStatusAction(formData);

      if (result) {
        setTodos(todos.map(todo => 
          todo.task_todo_id === todoId ? result : todo
        ));
      }
    } catch (err: any) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Gagal mengupdate status todo",
        icon: "error"
      });
    }
  };

  if (loading) {
    return <div>Memuat todos...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Checklist</h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Todo
        </Button>
      </div>

      {todos.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Belum ada todos. Tambahkan todo pertama Anda!</p>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div key={todo.task_todo_id} className="flex items-center gap-2 p-3 border rounded-lg">
              <Checkbox
                checked={todo.task_todo_status === "DONE"}
                onCheckedChange={(checked: boolean) => 
                  handleStatusChange(
                    todo.task_todo_id, 
                    checked ? "DONE" : todo.task_todo_status === "DONE" ? "TODO" : todo.task_todo_status
                  )
                }
              />
              <span className={`flex-1 ${todo.task_todo_status === "DONE" ? "line-through text-gray-500" : ""}`}>
                {todo.task_todo_title}
              </span>
              <div className={`w-3 h-3 rounded-full ${
                statusColors[todo.task_todo_status] || "bg-gray-500"
              }`}></div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEdit(todo)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDelete(todo.task_todo_id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Todo" : "Tambah Todo"}</DialogTitle>
          </DialogHeader>
          {currentTodo && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={currentTodo.task_todo_title}
                  onChange={(e) => setCurrentTodo({
                    ...currentTodo,
                    task_todo_title: e.target.value
                  })}
                  placeholder="Judul todo"
                  required
                />
              </div>
              
              <div>
                <Label>Status</Label>
                <Select
                  value={currentTodo.task_todo_status}
                  onValueChange={(value: TaskTodo["task_todo_status"]) => 
                    setCurrentTodo({...currentTodo, task_todo_status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="DOING">Doing</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {isEditing ? "Update" : "Tambah"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}