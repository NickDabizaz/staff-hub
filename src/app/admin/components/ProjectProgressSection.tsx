import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ProjectProgress {
  project_id: number;
  project_name: string;
  project_deadline: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
}

interface ProjectProgressSectionProps {
  projects: ProjectProgress[];
}

export default function ProjectProgressSection({ projects }: ProjectProgressSectionProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold text-white">Progress Proyek</h3>
        <p className="text-sm text-slate-400">Presentase penyelesaian setiap proyek</p>
      </div>
      <div className="divide-y divide-slate-800 p-4 space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.project_id} className="pt-4 first:pt-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-white">{project.project_name}</p>
                <p className="text-xs text-slate-400">
                  Deadline: {format(new Date(project.project_deadline), "dd MMM yyyy", { locale: id })}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>
                  {project.completed_tasks} dari {project.total_tasks} tugas selesai
                </span>
                <span>{project.progress_percentage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    project.progress_percentage < 30
                      ? "bg-red-500"
                      : project.progress_percentage < 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${project.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 text-sm py-4">
            Tidak ada proyek
          </div>
        )}
      </div>
    </div>
  );
}