import { JobRolesManagement } from "./components/job-roles-management";

export default function AdminSettings() {
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Pengaturan</h1>
        <p className="mt-1 text-slate-400">Kelola konfigurasi sistem dan preferensi aplikasi.</p>
      </header>

      <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Kelola Job Roles</h2>
        </div>
        <div className="p-4">
          <JobRolesManagement />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-800 rounded-lg">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Preferensi Dasar</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-400">Pengaturan preferensi dasar akan datang di sini.</p>
        </div>
      </div>
    </main>
  );
}