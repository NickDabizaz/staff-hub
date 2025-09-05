"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Task } from "@/types";
import { supabaseServer } from "@/lib/supabase-server";

type KanbanState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

type KanbanAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

type KanbanContextType = {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  moveTask: (taskId: number, newStatus: Task["task_status"]) => Promise<void>;
  addTask: (task: Omit<Task, "task_id">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  fetchTasks: (projectId: number) => Promise<void>;
};

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

const initialState: KanbanState = {
  tasks: [],
  loading: false,
  error: null,
};

function kanbanReducer(state: KanbanState, action: KanbanAction): KanbanState {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload, loading: false };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload], loading: false };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.task_id === action.payload.task_id ? action.payload : task
        ),
        loading: false,
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.task_id !== action.payload),
        loading: false,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function KanbanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  const fetchTasks = async (projectId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Fetch tasks from database
      const sb = supabaseServer();
      const { data: tasks, error } = await sb
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: "SET_TASKS", payload: tasks || [] });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: "Gagal memuat tasks: " + error.message });
    }
  };

  const moveTask = async (taskId: number, newStatus: Task["task_status"]) => {
    try {
      // Update task status in database
      const sb = supabaseServer();
      const { data, error } = await sb
        .from('tasks')
        .update({ task_status: newStatus })
        .eq('task_id', taskId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: "UPDATE_TASK", payload: data });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: "Gagal memindahkan task: " + error.message });
    }
  };

  const addTask = async (task: Omit<Task, "task_id">) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // If team_id is not provided, fetch the first team associated with this project
      let teamId = task.team_id;
      if (!teamId) {
        const sb = supabaseServer();
        const { data: projectTeams, error: teamError } = await sb
          .from('project_teams')
          .select('team_id')
          .eq('project_id', task.project_id)
          .limit(1)
          .single();

        if (teamError) {
          throw new Error("Gagal mendapatkan team untuk project: " + teamError.message);
        }

        teamId = projectTeams.team_id;
      }

      // Add task to database with the correct team_id
      const sb = supabaseServer();
      const { data, error } = await sb
        .from('tasks')
        .insert({
          ...task,
          team_id: teamId
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: "ADD_TASK", payload: data });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: "Gagal menambah task: " + error.message });
    }
  };

  const updateTask = async (task: Task) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Update task in database
      const sb = supabaseServer();
      const { data, error } = await sb
        .from('tasks')
        .update({
          project_id: task.project_id,
          team_id: task.team_id,
          assignee_user_id: task.assignee_user_id,
          task_title: task.task_title,
          task_description: task.task_description,
          task_status: task.task_status,
          task_priority: task.task_priority,
          task_due_date: task.task_due_date,
          task_progress: task.task_progress
        })
        .eq('task_id', task.task_id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: "UPDATE_TASK", payload: data });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: "Gagal mengupdate task: " + error.message });
    }
  };

  const deleteTask = async (taskId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Delete task from database
      const sb = supabaseServer();
      const { error } = await sb
        .from('tasks')
        .delete()
        .eq('task_id', taskId);

      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: "DELETE_TASK", payload: taskId });
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: "Gagal menghapus task: " + error.message });
    }
  };

  return (
    <KanbanContext.Provider
      value={{
        state,
        dispatch,
        moveTask,
        addTask,
        updateTask,
        deleteTask,
        fetchTasks,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
}