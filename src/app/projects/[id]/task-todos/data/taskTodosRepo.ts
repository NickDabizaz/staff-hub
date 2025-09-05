"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { TaskTodo } from "@/types";
import { Result, ok, err } from "@/lib/result";

/**
 * Semua akses ke Supabase dikumpulkan di sini.
 * Repository TIDAK berisi aturan bisnis.
 */

export async function getTaskTodosRepo(taskId: number): Promise<Result<TaskTodo[]>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("task_todos")
    .select("*")
    .eq("task_id", taskId)
    .order("task_todo_id", { ascending: true });

  if (error) return err(error.message);
  return ok(data ?? []);
}

export async function addTaskTodoRepo(input: {
  task_id: number;
  assignee_user_id: number | null;
  task_todo_title: string;
  task_todo_status: 'TODO' | 'DOING' | 'DONE';
  task_todo_evidence: string | null;
  task_todo_due_date: string | null;
}): Promise<Result<TaskTodo>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("task_todos")
    .insert({
      task_id: input.task_id,
      assignee_user_id: input.assignee_user_id,
      task_todo_title: input.task_todo_title,
      task_todo_status: input.task_todo_status,
      task_todo_evidence: input.task_todo_evidence,
      task_todo_due_date: input.task_todo_due_date
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

export async function editTaskTodoRepo(input: {
  task_todo_id: number;
  task_id: number;
  assignee_user_id: number | null;
  task_todo_title: string;
  task_todo_status: 'TODO' | 'DOING' | 'DONE';
  task_todo_evidence: string | null;
  task_todo_due_date: string | null;
}): Promise<Result<TaskTodo>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("task_todos")
    .update({
      task_id: input.task_id,
      assignee_user_id: input.assignee_user_id,
      task_todo_title: input.task_todo_title,
      task_todo_status: input.task_todo_status,
      task_todo_evidence: input.task_todo_evidence,
      task_todo_due_date: input.task_todo_due_date
    })
    .eq("task_todo_id", input.task_todo_id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

export async function deleteTaskTodoRepo(taskTodoId: number): Promise<Result<null>> {
  const sb = supabaseServer();
  const { error } = await sb
    .from("task_todos")
    .delete()
    .eq("task_todo_id", taskTodoId);

  if (error) return err(error.message);
  return ok(null);
}

export async function updateTaskTodoStatusRepo(
  taskTodoId: number, 
  status: 'TODO' | 'DOING' | 'DONE'
): Promise<Result<TaskTodo>> {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("task_todos")
    .update({ task_todo_status: status })
    .eq("task_todo_id", taskTodoId)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}