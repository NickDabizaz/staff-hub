"use server";

import { revalidatePath } from "next/cache";
import { 
  getTaskTodosService, 
  addTaskTodoService, 
  editTaskTodoService, 
  deleteTaskTodoService,
  updateTaskTodoStatusService
} from "./services/taskTodosService";
import { TaskTodo } from "@/types";

function parseNumber(value: FormDataEntryValue | null): number {
  return Number(value ?? NaN);
}

function parseDate(value: FormDataEntryValue | null): string | null {
  const dateStr = String(value || "");
  return dateStr ? dateStr : null;
}

export async function getTaskTodosAction(taskId: number) {
  const res = await getTaskTodosService(taskId);
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

export async function addTaskTodoAction(formData: FormData) {
  const taskId = parseNumber(formData.get("task_id"));
  if (isNaN(taskId)) throw new Error("Task ID tidak valid");
  
  const payload = {
    task_id: taskId,
    assignee_user_id: formData.get("assignee_user_id") ? parseNumber(formData.get("assignee_user_id")) : null,
    task_todo_title: String(formData.get("task_todo_title") || ""),
    task_todo_status: String(formData.get("task_todo_status") || "TODO") as 'TODO' | 'DOING' | 'DONE',
    task_todo_evidence: formData.get("task_todo_evidence") ? String(formData.get("task_todo_evidence")) : null,
    task_todo_due_date: formData.get("task_todo_due_date") ? parseDate(formData.get("task_todo_due_date")) : null,
  };

  // Validasi sederhana
  if (!payload.task_todo_title.trim()) {
    throw new Error("Judul todo tidak boleh kosong");
  }

  const res = await addTaskTodoService(payload);
  if (!res.ok) throw new Error(res.error);

  revalidatePath(`/projects/${taskId}`);
  return res.data;
}

export async function editTaskTodoAction(formData: FormData) {
  const taskTodoId = parseNumber(formData.get("task_todo_id"));
  const taskId = parseNumber(formData.get("task_id"));
  
  if (isNaN(taskTodoId)) throw new Error("Task Todo ID tidak valid");
  if (isNaN(taskId)) throw new Error("Task ID tidak valid");
  
  const payload = {
    task_todo_id: taskTodoId,
    task_id: taskId,
    assignee_user_id: formData.get("assignee_user_id") ? parseNumber(formData.get("assignee_user_id")) : null,
    task_todo_title: String(formData.get("task_todo_title") || ""),
    task_todo_status: String(formData.get("task_todo_status") || "TODO") as 'TODO' | 'DOING' | 'DONE',
    task_todo_evidence: formData.get("task_todo_evidence") ? String(formData.get("task_todo_evidence")) : null,
    task_todo_due_date: formData.get("task_todo_due_date") ? parseDate(formData.get("task_todo_due_date")) : null,
  };

  // Validasi sederhana
  if (!payload.task_todo_title.trim()) {
    throw new Error("Judul todo tidak boleh kosong");
  }

  const res = await editTaskTodoService(payload);
  if (!res.ok) throw new Error(res.error);

  revalidatePath(`/projects/${taskId}`);
  return res.data;
}

export async function deleteTaskTodoAction(formData: FormData) {
  const taskTodoId = parseNumber(formData.get("task_todo_id"));
  const taskId = parseNumber(formData.get("task_id"));
  
  if (isNaN(taskTodoId)) throw new Error("Task Todo ID tidak valid");
  if (isNaN(taskId)) throw new Error("Task ID tidak valid");

  const res = await deleteTaskTodoService(taskTodoId);
  if (!res.ok) throw new Error(res.error);

  revalidatePath(`/projects/${taskId}`);
}

export async function updateTaskTodoStatusAction(formData: FormData) {
  const taskTodoId = parseNumber(formData.get("task_todo_id"));
  const taskId = parseNumber(formData.get("task_id"));
  const status = String(formData.get("status") || "TODO") as 'TODO' | 'DOING' | 'DONE';
  
  if (isNaN(taskTodoId)) throw new Error("Task Todo ID tidak valid");
  if (isNaN(taskId)) throw new Error("Task ID tidak valid");

  const res = await updateTaskTodoStatusService(taskTodoId, status);
  if (!res.ok) throw new Error(res.error);

  revalidatePath(`/projects/${taskId}`);
  return res.data;
}