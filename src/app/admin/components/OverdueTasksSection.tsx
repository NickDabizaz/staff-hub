import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface OverdueTask {
  task_id: number;
  task_title: string;
  project_name: string;
  assignee_name: string | null;
  task_due_date: string;
  days_overdue: number;
}

interface OverdueTasksSectionProps {
  tasks: OverdueTask[];
}

export default function OverdueTasksSection({ tasks }: OverdueTasksSectionProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold text-white">Tugas Terlambat</h3>
        <p className="text-sm text-slate-400">Daftar tugas yang melewati tenggat waktu</p>
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
                <p className="text-sm font-semibold text-red-500">{task.days_overdue} hari terlambat</p>
                <p className="text-xs text-slate-500">
                  Jatuh tempo: {format(new Date(task.task_due_date), "dd MMM yyyy", { locale: id })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-500 text-sm">
            Tidak ada tugas terlambat
          </div>
        )}
      </div>
    </div>
  );
}