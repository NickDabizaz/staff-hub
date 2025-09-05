import { z } from "zod";

/**
 * Schema validasi untuk membuat proyek baru
 * Memastikan data yang diterima sesuai dengan format yang diharapkan
 */
export const CreateProjectSchema = z.object({
  project_name: z.string().min(1, "Nama project wajib diisi"),
  project_description: z.string().optional(),
  project_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)"),
  team_ids: z.array(z.number().int().positive()).default([]),
});