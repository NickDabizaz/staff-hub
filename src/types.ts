export type User = {
  user_id: number;
  user_name: string;
  user_email: string;
  user_system_role: 'ADMIN' | 'PM' | 'STAFF';
};

export type Team = {
  team_id: number;
  team_name: string;
};

export type TeamMember = {
  team_member_id: number;
  team_id: number;
  user_id: number;
  team_member_role: 'PM' | 'STAFF';
};

export type JobRole = {
  job_role_id: number;
  job_role_name: string;
};

export type Project = {
  project_id: number;
  project_name: string;
  project_description: string | null;
  project_deadline: string; // date format
};

export type Task = {
  task_id: number;
  project_id: number;
  team_id: number;
  assignee_user_id: number | null;
  task_title: string;
  task_description: string | null;
  task_status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  task_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  task_due_date: string | null; // date format
  task_progress: number; // 0-100
};

export type TaskTodo = {
  task_todo_id: number;
  task_id: number;
  assignee_user_id: number | null;
  task_todo_title: string;
  task_todo_status: 'TODO' | 'DOING' | 'DONE';
  task_todo_evidence: string | null;
  task_todo_due_date: string | null; // date format
};