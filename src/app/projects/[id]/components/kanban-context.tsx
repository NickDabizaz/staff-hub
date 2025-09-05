"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Task } from "@/types";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Tipe data untuk state manajemen Kanban
 * Mendefinisikan struktur state yang digunakan dalam context provider
 */
type KanbanState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

/**
 * Tipe data untuk aksi yang dapat dilakukan pada state Kanban
 * Mendefinisikan berbagai aksi yang dapat memodifikasi state
 */
type KanbanAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

/**
 * Tipe data untuk context Kanban
 * Mendefinisikan fungsi-fungsi dan state yang tersedia dalam context
 */
type KanbanContextType = {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  moveTask: (taskId: number, newStatus: Task["task_status"]) => Promise<void>;
  addTask: (task: Omit<Task, "task_id">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  fetchTasks: (projectId: number) => Promise<void>;
};

/**
 * Membuat context Kanban dengan nilai default undefined
 */
const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

/**
 * State awal untuk reducer Kanban
 */
const initialState: KanbanState = {
  tasks: [],
  loading: false,
  error: null,
};

/**
 * Reducer untuk manajemen state Kanban
 * Mengelola perubahan state berdasarkan aksi yang diterima
 * 
 * @param state - State saat ini
 * @param action - Aksi yang akan diterapkan
 * @returns State baru setelah aksi diterapkan
 */
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

/**
 * Provider untuk context Kanban
 * Menyediakan state dan fungsi-fungsi manajemen tugas ke komponen anak
 * 
 * @param children - Komponen anak yang akan menggunakan context
 * @returns Provider context dengan state dan fungsi-fungsi manajemen tugas
 */
export function KanbanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  /**
   * Mengambil daftar tugas untuk suatu proyek dari database
   * 
   * @param projectId - ID proyek yang tugasnya akan diambil
   */
  const fetchTasks = async (projectId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Mengambil tugas dari database
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

  /**
   * Memindahkan tugas ke status baru
   * 
   * @param taskId - ID tugas yang akan dipindahkan
   * @param newStatus - Status baru untuk tugas
   */
  const moveTask = async (taskId: number, newStatus: Task["task_status"]) => {
    try {
      // Memperbarui status tugas di database
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

  /**
   * Menambahkan tugas baru ke database
   * 
   * @param task - Data tugas baru yang akan ditambahkan
   */
  const addTask = async (task: Omit<Task, "task_id">) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Jika team_id tidak disediakan, ambil tim pertama yang terkait dengan proyek ini
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

      // Menambahkan tugas ke database dengan team_id yang benar
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

  /**
   * Memperbarui informasi tugas di database
   * 
   * @param task - Data tugas yang diperbarui
   */
  const updateTask = async (task: Task) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Memperbarui tugas di database
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

  /**
   * Menghapus tugas dari database
   * 
   * @param taskId - ID tugas yang akan dihapus
   */
  const deleteTask = async (taskId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Menghapus tugas dari database
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

/**
 * Custom hook untuk menggunakan context Kanban
 * Memberikan akses ke state dan fungsi-fungsi manajemen tugas
 * 
 * @returns Object context Kanban dengan state dan fungsi-fungsi
 */
export function useKanban() {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
}