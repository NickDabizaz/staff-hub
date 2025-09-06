import React from "react";

/**
 * Interface untuk struktur data proyek
 * Mendefinisikan properti yang dimiliki setiap proyek
 */
interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline?: string;
  progress?: number;
}

/**
 * Interface untuk props komponen ProjectList
 * Mendefinisikan struktur data yang diterima oleh komponen ProjectList
 */
interface ProjectListProps {
  projects: Project[];
}

/**
 * Komponen untuk menampilkan daftar proyek dalam bentuk kartu
 * Menampilkan setiap proyek sebagai kartu yang dapat diklik untuk melihat detail
 * 
 * @param projects - Array dari objek proyek yang akan ditampilkan
 * @returns Komponen React yang menampilkan daftar proyek
 */
export default function ProjectList({ projects }: ProjectListProps) {
  /**
   * Fungsi untuk menentukan kelas CSS berdasarkan status proyek
   * Digunakan untuk memberikan styling yang berbeda berdasarkan status proyek
   * 
   * @param status - Status proyek dalam bentuk string
   * @returns Nama kelas CSS yang sesuai dengan status proyek
   */
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20";
      case "in progress":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20";
      case "completed":
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20";
      default:
        return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20";
    }
  };

  /**
   * Fungsi untuk memformat tanggal deadline
   * 
   * @param deadline - Tanggal deadline dalam format string
   * @returns Tanggal yang diformat dalam format DD MMM YYYY
   */
  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return "";
    
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="bg-slate-800/50 border border-slate-800 rounded-lg shadow-lg hover:border-sky-500 transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={getStatusClass(project.status)}>
                    {project.status}
                  </span>
                  <a href={`/projects/${project.id}`} className="text-slate-500 hover:text-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                      <path d="m21 3-9 9"></path>
                      <path d="M15 3h6v6"></path>
                    </svg>
                  </a>
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">{project.title}</h2>
                <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
              </div>
              <div className="border-t border-slate-800 px-6 py-4 space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium text-slate-300">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-sky-500 h-2 rounded-full" 
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
                {/* Team & Deadline */}
                <div className="flex justify-end items-center">
                  <div className="text-xs text-slate-400">
                    {formatDeadline(project.deadline)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white/80">Tidak ada project</h3>
          <p className="mt-2 text-white/60">Anda belum memiliki project yang ditugaskan.</p>
        </div>
      )}
    </>
  );
}