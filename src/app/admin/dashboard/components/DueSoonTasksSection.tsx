import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DueSoonTask {
  task_id: number;
  task_title: string;
  project_name: string;
  assignee_name: string | null;
  task_due_date: string;
  days_until_due: number;
}

interface DueSoonTasksSectionProps {
  tasks: DueSoonTask[];
}

export default function DueSoonTasksSection({ tasks }: DueSoonTasksSectionProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold text-white">Jatuh Tempo dalam 7 Hari</h3>
        <p className="text-sm text-slate-400">Daftar tugas yang akan jatuh tempo dalam seminggu ke depan</p>
      </div>
      <div className="divide-y divide-slate-800">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.task_id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-white">{task.task_title}</p>
                <p className="text-xs text-slate-400">
                  {task.project_name} - {task.assignee_name || "Tidak di-assign"}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${task.days_until_due <= 2 ? "text-red-500" : "text-white"}`}>
                  {task.days_until_due} hari lagi
                </p>
                <p className="text-xs text-slate-500">
                  Jatuh tempo: {format(new Date(task.task_due_date), "dd MMM yyyy", { locale: id })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-500 text-sm">
            Tidak ada tugas yang akan jatuh tempo dalam 7 hari ke depan
          </div>
        )}
      </div>
    </div>
  );
}