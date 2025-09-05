"use server";

import { cookies } from "next/headers";
import { 
  getTaskTodosRepo, 
  addTaskTodoRepo, 
  editTaskTodoRepo, 
  deleteTaskTodoRepo,
  updateTaskTodoStatusRepo
} from "./data/taskTodosRepo";
import { TaskTodo } from "@/types";
import { Result, ok, err } from "@/lib/result";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'STAFF';
};

async function currentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sb_user")?.value;
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

function ensureAuthenticated(user: SessionUser | null): Result<null> {
  if (!user) return err("UNAUTHORIZED");
  return ok(null);
}

export async function getTaskTodosService(taskId: number): Promise<Result<TaskTodo[]>> {
  const me = await currentUser();
  const auth = ensureAuthenticated(me);
  if (!auth.ok) return auth as unknown as Result<TaskTodo[]>;
  
  return await getTaskTodosRepo(taskId);
}

export async function addTaskTodoService(input: {
  task_id: number;
  assignee_user_id: number | null;
  task_todo_title: string;
  task_todo_status: 'TODO' | 'DOING' | 'DONE';
  task_todo_evidence: string | null;
  task_todo_due_date: string | null;
}): Promise<Result<TaskTodo>> {
  const me = await currentUser();
  const auth = ensureAuthenticated(me);
  if (!auth.ok) return auth as unknown as Result<TaskTodo>;
  
  return await addTaskTodoRepo(input);
}

export async function editTaskTodoService(input: {
  task_todo_id: number;
  task_id: number;
  assignee_user_id: number | null;
  task_todo_title: string;
  task_todo_status: 'TODO' | 'DOING' | 'DONE';
  task_todo_evidence: string | null;
  task_todo_due_date: string | null;
}): Promise<Result<TaskTodo>> {
  const me = await currentUser();
  const auth = ensureAuthenticated(me);
  if (!auth.ok) return auth as unknown as Result<TaskTodo>;
  
  return await editTaskTodoRepo(input);
}

export async function deleteTaskTodoService(taskTodoId: number): Promise<Result<null>> {
  const me = await currentUser();
  const auth = ensureAuthenticated(me);
  if (!auth.ok) return auth;
  
  return await deleteTaskTodoRepo(taskTodoId);
}

export async function updateTaskTodoStatusService(
  taskTodoId: number, 
  status: 'TODO' | 'DOING' | 'DONE'
): Promise<Result<TaskTodo>> {
  const me = await currentUser();
  const auth = ensureAuthenticated(me);
  if (!auth.ok) return auth as unknown as Result<TaskTodo>;
  
  return await updateTaskTodoStatusRepo(taskTodoId, status);
}