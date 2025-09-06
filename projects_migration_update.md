### 5. Migrasi Manajemen Projects (`/admin/projects`) - ✅ SELESAI

**File Target:** `src/app/admin/projects/page.tsx`
**File Referensi:** `new_ui/admin_project.html`

**Langkah-langkah:**
1. ✅ Implementasikan view switching antara:
   - List view (tabel projects)
   - Form view (tambah/edit project)
2. ✅ Buat tabel projects dengan:
   - Nama project, deadline, tim, aksi
   - Team badges untuk setiap project
   - Action buttons
3. ✅ Implementasikan form project dengan:
   - Input nama project, deskripsi, deadline
   - Checkbox list untuk tim yang menangani
   - Button submit dan kembali
4. ✅ Pastikan semua operasi project management tetap berfungsi
5. ✅ Menambahkan fitur hapus project dengan konfirmasi
6. ✅ Memperbaiki error pada fungsi tambah user agar secara otomatis menambahkan domain @staffhub.com

**Komponen yang perlu diubah:**
- `src/app/admin/projects/components/ProjectsList.tsx`
- `src/app/admin/projects/components/CreateProjectForm.tsx`
- `src/app/admin/projects/actions.ts`
- `src/app/admin/projects/services/projectService.ts`
- `src/app/admin/projects/data/projectsRepo.ts`
- `src/app/admin/projects/[id]/components/DeleteProjectButton.tsx`