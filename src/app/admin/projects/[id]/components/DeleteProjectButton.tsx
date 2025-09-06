"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { deleteProjectAction } from "../../actions";
import { Trash2 } from "lucide-react";

/**
 * Komponen tombol hapus untuk menghapus proyek
 * Menampilkan konfirmasi sebelum menghapus proyek
 * 
 * @param project_id - ID proyek yang akan dihapus
 * @param project_name - Nama proyek yang akan dihapus
 * @returns Tombol hapus dengan handler konfirmasi
 */
export default function DeleteProjectButton({ 
  project_id, 
  project_name 
}: { 
  project_id: number; 
  project_name: string; 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handler untuk menghapus proyek
   * Menampilkan konfirmasi dan menghapus proyek jika dikonfirmasi
   */
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Hapus Project?',
      text: `Apakah Anda yakin ingin menghapus project "${project_name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("project_id", project_id.toString());

      await deleteProjectAction(fd);

      await Swal.fire({
        title: 'Dihapus!',
        text: `Project "${project_name}" telah berhasil dihapus.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      // Redirect ke halaman projects setelah penghapusan berhasil
      router.push('/admin/projects');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus project';
      
      await Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error'
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="inline-flex items-center justify-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-red-500 transition-all duration-300 text-sm disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isLoading ? 'Menghapus...' : 'Hapus Project'}
    </button>
  );
}