"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { Task } from "@/types";

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
      // In a real implementation, you would fetch from your API
      // const response = await fetch(`/api/projects/${projectId}/tasks`);
      // const tasks = await response.json();
      
      // For now, we'll use mock data
      const mockTasks: Task[] = [
        {
          task_id: 1,
          project_id: projectId,
          team_id: 1,
          assignee_user_id: 1,
          task_title: "Create wireframes",
          task_description: "Create initial wireframes for the new dashboard",
          task_status: "TODO",
          task_priority: "HIGH",
          task_due_date: "2023-12-31",
          task_progress: 0,
        },
        {
          task_id: 2,
          project_id: projectId,
          team_id: 1,
          assignee_user_id: 2,
          task_title: "Implement auth system",
          task_description: "Set up authentication and authorization",
          task_status: "IN_PROGRESS",
          task_priority: "URGENT",
          task_due_date: "2023-11-30",
          task_progress: 50,
        },
        {
          task_id: 3,
          project_id: projectId,
          team_id: 1,
          assignee_user_id: 3,
          task_title: "Write documentation",
          task_description: "Create user guides and API documentation",
          task_status: "DONE",
          task_priority: "MEDIUM",
          task_due_date: "2023-10-31",
          task_progress: 100,
        },
        {
          task_id: 4,
          project_id: projectId,
          team_id: 1,
          assignee_user_id: 4,
          task_title: "Design database schema",
          task_description: "Create database schema for the new features",
          task_status: "TODO",
          task_priority: "HIGH",
          task_due_date: "2023-12-15",
          task_progress: 0,
        },
        {
          task_id: 5,
          project_id: projectId,
          team_id: 1,
          assignee_user_id: 5,
          task_title: "Setup CI/CD pipeline",
          task_description: "Configure continuous integration and deployment",
          task_status: "BLOCKED",
          task_priority: "MEDIUM",
          task_due_date: "2023-11-20",
          task_progress: 0,
        },
      ];
      
      dispatch({ type: "SET_TASKS", payload: mockTasks });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch tasks" });
    }
  };

  const moveTask = async (taskId: number, newStatus: Task["task_status"]) => {
    try {
      // In a real implementation, you would make an API call here
      // await fetch(`/api/tasks/${taskId}/status`, { 
      //   method: 'PATCH', 
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // For now, we'll just update the local state
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          ...state.tasks.find((task) => task.task_id === taskId)!,
          task_status: newStatus,
        },
      });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to move task" });
    }
  };

  const addTask = async (task: Omit<Task, "task_id">) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // In a real implementation, you would make an API call here
      // const response = await fetch('/api/tasks', { 
      //   method: 'POST', 
      //   body: JSON.stringify(task) 
      // });
      // const newTask = await response.json();
      
      // For now, we'll just add a mock task with a new ID
      const newTask: Task = {
        ...task,
        task_id: Math.max(0, ...state.tasks.map(t => t.task_id)) + 1,
      } as Task;
      
      dispatch({ type: "ADD_TASK", payload: newTask });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add task" });
    }
  };

  const updateTask = async (task: Task) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // In a real implementation, you would make an API call here
      // await fetch(`/api/tasks/${task.task_id}`, { 
      //   method: 'PUT', 
      //   body: JSON.stringify(task) 
      // });
      
      dispatch({ type: "UPDATE_TASK", payload: task });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update task" });
    }
  };

  const deleteTask = async (taskId: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // In a real implementation, you would make an API call here
      // await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      
      dispatch({ type: "DELETE_TASK", payload: taskId });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete task" });
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