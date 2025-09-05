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
      case "in progress":
        return "status-in-progress";
      case "pending":
        return "status-pending";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  return (
    <>
      {projects.length > 0 ? (
        <section className="mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 project-card"
              aria-label={project.title}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">{project.description}</p>
              <div className="mt-4">
                <span className={`status-badge ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </a>
          ))}
        </section>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-white/80">Tidak ada project</h3>
          <p className="mt-2 text-white/60">Anda belum memiliki project yang ditugaskan.</p>
        </div>
      )}
    </>
  );
}