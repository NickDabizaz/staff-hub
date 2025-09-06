# Dokumentasi Migrasi UI Staff Hub

## Overview

Dokumentasi ini berisi panduan step-by-step untuk melakukan migrasi UI Staff Hub dari tampilan lama ke tampilan baru yang telah dibuat di folder `new_ui/`. Setiap halaman akan dimigrasikan secara terpisah untuk memastikan tidak ada fungsionalitas yang hilang.

## Struktur File UI Baru

Berdasarkan analisis folder `new_ui/`, berikut adalah mapping file HTML ke halaman yang akan dimigrasikan:

| File HTML | Target Halaman | Deskripsi |
|-----------|----------------|-----------|
| `login_page.html` | `/login` | Halaman login dengan dark theme |
| `admin_menu_dashboard.html` | `/admin` | Dashboard admin dengan statistik dan overview |
| `admin_user.html` | `/admin/users` | Manajemen user dengan form tambah dan tabel |
| `admin_team.html` | `/admin/teams` | Manajemen team dengan modal tambah team |
| `admin_project.html` | `/admin/projects` | Manajemen project dengan form dan tabel |
| `admin_setting.html` | `/admin/settings` | Pengaturan sistem dan job roles |
| `user_menu_or_dashboard.html` | `/` | Dashboard user dengan project cards |
| `user_project.html` | `/projects/[id]` | Detail project dengan kanban board |

## Panduan Migrasi Per Halaman

### 1. Migrasi Halaman Login (`/login`) - ✅ SELESAI

**File Target:** `src/app/login/page.tsx`
**File Referensi:** `new_ui/login_page.html`

**Langkah-langkah:**
1. ✅ Ganti seluruh konten komponen `LoginForm` dengan desain dari `login_page.html`
2. ✅ Implementasikan dark theme dengan warna:
   - Background: `bg-slate-950`
   - Card: `bg-slate-800/50 border border-slate-800`
   - Input: `bg-slate-800 border border-slate-700`
   - Button: `bg-sky-600 hover:bg-sky-500`
3. ✅ Pastikan form validation tetap berfungsi
4. ✅ Implementasikan responsive design untuk mobile
5. ✅ Gunakan font Inter dari Google Fonts
6. ✅ Tambahkan animasi hover dan focus states
7. ✅ Tambahkan notifikasi error yang jelas ketika login gagal

**Komponen yang perlu diubah:**
- `src/app/login/components/LoginForm.tsx`

### 2. Migrasi Dashboard Admin (`/admin`)

**File Target:** `src/app/admin/page.tsx`
**File Referensi:** `new_ui/admin_menu_dashboard.html`

**Langkah-langkah:**
1. ✅ Implementasikan sidebar navigation dengan:
   - Logo Staff Hub dengan icon
   - Menu items: Dashboard, Users, Teams, Projects, Settings
   - Active state untuk menu yang sedang aktif
2. ✅ Buat header dengan breadcrumb dan user dropdown
3. ✅ Implementasikan stat cards dengan:
   - Total Proyek
   - Total Tugas
   - Tugas Terlambat
   - Jatuh Tempo 7 Hari
4. ✅ Buat section "Tugas Terlambat" dengan tabel
5. ✅ Buat section "Jatuh Tempo dalam 7 Hari"
6. ✅ Implementasikan "Progress Proyek" dengan progress bars
7. ✅ Pastikan semua data dinamis dari database

**Komponen yang perlu dibuat:**
- Sidebar navigation component
- Stat cards component
- Overdue tasks component
- Project progress component

### 3. Migrasi Manajemen Users (`/admin/users`) - ✅ SELESAI

**File Target:** `src/app/admin/users/page.tsx`
**File Referensi:** `new_ui/admin_user.html`

**Langkah-langkah:**
1. ✅ Implementasikan form tambah user dengan:
   - Input nama, email, password, role
   - Button submit dengan icon
   - Layout grid responsive
2. ✅ Buat tabel users dengan:
   - Search functionality
   - Filter by role
   - Action buttons (Edit, Nonaktifkan)
   - Role badges dengan warna berbeda
3. ✅ Implementasikan modal atau form edit user
4. ✅ Pastikan semua CRUD operations tetap berfungsi
5. ✅ Tambahkan loading states dan error handling
6. ✅ Perbaiki penanganan input email agar secara otomatis menambahkan domain @staffhub.com

**Komponen yang perlu diubah:**
- `src/app/admin/users/components/UsersAdmin.tsx`

### 4. Migrasi Manajemen Teams (`/admin/teams`) - ✅ SELESAI

**File Target:** `src/app/admin/teams/page.tsx`
**File Referensi:** `new_ui/admin_team.html`

**Langkah-langkah:**
1. ✅ Implementasikan tabel teams dengan:
   - Team ID, Nama, Anggota, PM columns
   - Search functionality
   - Action buttons
2. ✅ Buat modal "Tambah Team" dengan:
   - Input nama tim
   - Select project manager
   - Checkbox list untuk anggota team
   - Button submit dan cancel
3. ✅ Implementasikan modal detail team
4. ✅ Pastikan semua operasi team management tetap berfungsi

**Komponen yang perlu diubah:**
- `src/app/admin/teams/components/TeamsAdmin.tsx`
- `src/app/admin/teams/components/TeamDetailModal.tsx`

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

### 6. Migrasi Pengaturan Admin (`/admin/settings`) - ✅ SELESAI

**File Target:** `src/app/admin/settings/page.tsx`
**File Referensi:** `new_ui/admin_setting.html`

**Langkah-langkah:**
1. ✅ Implementasikan section "Kelola Job Roles" dengan:
   - Input untuk tambah job role baru
   - Grid layout untuk job roles yang ada
   - Button hapus untuk setiap job role
2. ✅ Implementasikan section "Preferensi Dasar" (placeholder untuk future features)
3. ✅ Pastikan job roles management tetap berfungsi
4. ✅ Tambahkan loading states dan error handling

**Komponen yang perlu diubah:**
- `src/app/admin/settings/components/job-roles-management.tsx`

### 7. Migrasi Dashboard User (`/`) - ✅ SELESAI

**File Target:** `src/app/page.tsx`
**File Referensi:** `new_ui/user_menu_or_dashboard.html`

**Langkah-langkah:**
1. ✅ Implementasikan navigation bar dengan:
   - Logo Staff Hub
   - User dropdown menu
   - Responsive design
2. ✅ Buat header dengan welcome message
3. ✅ Implementasikan project cards dengan:
   - Status badges (Active, In Progress, etc.)
   - Progress bars
   - Deadline information
   - Hover effects
4. ✅ Pastikan semua project data dinamis dari database
5. ✅ Implementasikan responsive grid layout

**Komponen yang perlu diubah:**
- `src/components/Navbar.tsx`
- `src/components/user/ProjectList.tsx`

### 8. Migrasi Detail Project User (`/projects/[id]`)

**File Target:** `src/app/projects/[id]/page.tsx`
**File Referensi:** `new_ui/user_project.html`

**Langkah-langkah:**
1. Implementasikan navigation bar (sama dengan dashboard user)
2. Buat page header dengan:
   - Breadcrumb navigation
   - Project title dan deskripsi
   - Button "Tambah Tugas"
3. Implementasikan controls dengan:
   - Search input
   - Filter button
4. Buat kanban board dengan 4 kolom:
   - To Do (biru)
   - In Progress (kuning)
   - Done (hijau)
   - Blocked (merah)
5. Implementasikan task cards dengan:
   - Title, deskripsi, priority badges
   - Due date dan assignee avatar
   - Hover effects
6. Buat modal "Tambah Tugas" dengan form lengkap
7. Buat modal "Edit Tugas" dengan form yang sudah terisi
8. Pastikan semua operasi task management tetap berfungsi

**Komponen yang perlu diubah:**
- `src/app/projects/[id]/components/kanban-board.tsx`
- `src/app/projects/[id]/components/task-card.tsx`
- `src/app/projects/[id]/components/edit-task-modal.tsx`
- `src/app/projects/[id]/components/quick-add-task.tsx`

## Design System & Styling

### Color Palette
- Primary: `sky-500` (untuk buttons dan accents)
- Background: `slate-950` (main background)
- Cards: `slate-800/50` dengan border `slate-800`
- Text Primary: `white`
- Text Secondary: `slate-400`
- Text Muted: `slate-500`

### Typography
- Font Family: Inter (Google Fonts)
- Headings: `font-bold`
- Body: `font-medium` atau `font-normal`
- Small text: `text-sm` atau `text-xs`

### Spacing & Layout
- Container padding: `p-6`
- Card padding: `p-4` atau `p-6`
- Gap between elements: `space-y-6` atau `gap-6`
- Border radius: `rounded-lg`

### Interactive Elements
- Hover states: `hover:bg-slate-800`, `hover:text-sky-400`
- Focus states: `focus:ring-2 focus:ring-sky-500`
- Transitions: `transition-all duration-300`

## Komponen UI yang Perlu Dibuat

### Shared Components
1. **Sidebar** - Navigation sidebar untuk admin pages
2. **Header** - Header dengan breadcrumb dan user menu
3. **StatCard** - Card untuk menampilkan statistik
4. **SearchInput** - Input search dengan icon
5. **FilterButton** - Button filter dengan dropdown
6. **Modal** - Base modal component
7. **Badge** - Status badges dengan berbagai warna
8. **ProgressBar** - Progress bar component

### Admin Components
1. **UserTable** - Tabel untuk menampilkan users
2. **TeamTable** - Tabel untuk menampilkan teams
3. **ProjectTable** - Tabel untuk menampilkan projects
4. **JobRoleGrid** - Grid untuk job roles management

### User Components
1. **ProjectCard** - Card untuk menampilkan project
2. **KanbanColumn** - Column untuk kanban board
3. **TaskCard** - Card untuk menampilkan task
4. **TaskModal** - Modal untuk add/edit task

## Testing & Validation

### Setiap migrasi harus memastikan:
1. **Fungsionalitas tetap berjalan** - Semua CRUD operations, validasi, dan business logic
2. **Responsive design** - Tampilan baik di desktop, tablet, dan mobile
3. **Accessibility** - Proper ARIA labels, keyboard navigation, screen reader support
4. **Performance** - Tidak ada regression dalam loading time
5. **Cross-browser compatibility** - Chrome, Firefox, Safari, Edge

### Checklist untuk setiap halaman:
- [x] UI sesuai dengan desain referensi (untuk halaman login)
- [x] Semua fungsi tetap berjalan (untuk halaman login)
- [x] Responsive di semua device (untuk halaman login)
- [x] Loading states dan error handling (untuk halaman login)
- [x] Form validation (untuk halaman login)
- [x] Navigation dan routing (untuk halaman login)
- [x] Data fetching dan state management (untuk halaman login)
- [x] UI sesuai dengan desain referensi (untuk halaman admin dashboard)
- [x] Semua fungsi tetap berjalan (untuk halaman admin dashboard)
- [x] Responsive di semua device (untuk halaman admin dashboard)
- [x] Loading states dan error handling (untuk halaman admin dashboard)
- [x] Form validation (untuk halaman admin dashboard)
- [x] Navigation dan routing (untuk halaman admin dashboard)
- [x] Data fetching dan state management (untuk halaman admin dashboard)
- [x] UI sesuai dengan desain referensi (untuk halaman admin users)
- [x] Semua fungsi tetap berjalan (untuk halaman admin users)
- [x] Responsive di semua device (untuk halaman admin users)
- [x] Loading states dan error handling (untuk halaman admin users)
- [x] Form validation (untuk halaman admin users)
- [x] Navigation dan routing (untuk halaman admin users)
- [x] Data fetching dan state management (untuk halaman admin users)
- [x] UI sesuai dengan desain referensi (untuk halaman admin teams)
- [x] Semua fungsi tetap berjalan (untuk halaman admin teams)
- [x] Responsive di semua device (untuk halaman admin teams)
- [x] Loading states dan error handling (untuk halaman admin teams)
- [x] Form validation (untuk halaman admin teams)
- [x] Navigation dan routing (untuk halaman admin teams)
- [x] Data fetching dan state management (untuk halaman admin teams)
- [x] UI sesuai dengan desain referensi (untuk halaman admin projects)
- [x] Semua fungsi tetap berjalan (untuk halaman admin projects)
- [x] Responsive di semua device (untuk halaman admin projects)
- [x] Loading states dan error handling (untuk halaman admin projects)
- [x] Form validation (untuk halaman admin projects)
- [x] Navigation dan routing (untuk halaman admin projects)
- [x] Data fetching dan state management (untuk halaman admin projects)
- [x] UI sesuai dengan desain referensi (untuk halaman admin settings)
- [x] Semua fungsi tetap berjalan (untuk halaman admin settings)
- [x] Responsive di semua device (untuk halaman admin settings)
- [x] Loading states dan error handling (untuk halaman admin settings)
- [x] Form validation (untuk halaman admin settings)
- [x] Navigation dan routing (untuk halaman admin settings)
- [x] Data fetching dan state management (untuk halaman admin settings)
- [x] UI sesuai dengan desain referensi (untuk halaman user dashboard)
- [x] Semua fungsi tetap berjalan (untuk halaman user dashboard)
- [x] Responsive di semua device (untuk halaman user dashboard)
- [x] Loading states dan error handling (untuk halaman user dashboard)
- [x] Form validation (untuk halaman user dashboard)
- [x] Navigation dan routing (untuk halaman user dashboard)
- [x] Data fetching dan state management (untuk halaman user dashboard)

## Urutan Migrasi yang Disarankan

1. **Login Page** - Paling sederhana, tidak ada dependencies
2. **User Dashboard** - Base untuk user experience
3. **User Project Detail** - Menggunakan komponen dari dashboard
4. **Admin Dashboard** - Base untuk admin experience
5. **Admin Users** - Relatif sederhana
6. **Admin Teams** - Menggunakan data dari users
7. **Admin Projects** - Menggunakan data dari teams
8. **Admin Settings** - Terakhir karena tidak critical

## Catatan Penting

1. **Backup** - Selalu backup code sebelum melakukan migrasi
2. **Incremental** - Lakukan migrasi satu halaman per satu
3. **Testing** - Test setiap halaman setelah migrasi
4. **Rollback Plan** - Siapkan plan untuk rollback jika ada masalah
5. **Documentation** - Update dokumentasi setelah setiap migrasi

## Troubleshooting

### Common Issues:
1. **Styling conflicts** - Pastikan Tailwind classes tidak conflict
2. **Component imports** - Update import paths jika ada perubahan struktur
3. **Type errors** - Update TypeScript interfaces jika diperlukan
4. **State management** - Pastikan state tetap konsisten
5. **API calls** - Pastikan semua API calls tetap berfungsi

### Debugging Tips:
1. Gunakan browser dev tools untuk inspect styling
2. Check console untuk JavaScript errors
3. Test semua user flows secara manual
4. Gunakan React DevTools untuk component debugging
5. Check network tab untuk API call issues