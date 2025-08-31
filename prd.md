# 📑 Staff Hub — PRD (MVP)

## A. Schema Database (SQL)

```sql
-- =========================================
-- Staff Hub - MVP schema (SQL only)
-- =========================================

-- 1) USERS
create table if not exists users (
  user_id           integer generated always as identity primary key,
  user_name         varchar(150) not null,
  user_email        varchar(255) not null unique,
  user_password     varchar(255) not null,
  user_system_role  varchar(10)  not null
    check (user_system_role in ('ADMIN','PM','STAFF'))
);

-- 2) TEAMS
create table if not exists teams (
  team_id    integer generated always as identity primary key,
  team_name  varchar(150) not null unique
);

-- 3) TEAM MEMBERS
create table if not exists team_members (
  team_member_id   integer generated always as identity primary key,
  team_id          integer not null references teams(team_id) on delete cascade,
  user_id          integer not null references users(user_id) on delete cascade,
  team_member_role varchar(10) not null
    check (team_member_role in ('PM','STAFF')),
  unique (team_id, user_id)
);
create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_team_members_user on team_members(user_id);

-- 4) JOB ROLES
create table if not exists job_roles (
  job_role_id    integer generated always as identity primary key,
  job_role_name  varchar(120) not null unique
);

-- 5) TEAM MEMBER ROLES
create table if not exists team_member_roles (
  team_member_role_id integer generated always as identity primary key,
  team_member_id      integer not null references team_members(team_member_id) on delete cascade,
  job_role_id         integer not null references job_roles(job_role_id),
  unique (team_member_id, job_role_id)
);
create index if not exists idx_tmr_member on team_member_roles(team_member_id);
create index if not exists idx_tmr_role   on team_member_roles(job_role_id);

-- 6) PROJECTS
create table if not exists projects (
  project_id          integer generated always as identity primary key,
  project_name        varchar(200) not null,
  project_description text,
  project_deadline    date not null
);

-- 7) PROJECT TEAMS
create table if not exists project_teams (
  project_team_id integer generated always as identity primary key,
  project_id      integer not null references projects(project_id) on delete cascade,
  team_id         integer not null references teams(team_id) on delete cascade,
  unique (project_id, team_id)
);
create index if not exists idx_project_teams_project on project_teams(project_id);
create index if not exists idx_project_teams_team    on project_teams(team_id);

-- 8) TASKS
create table if not exists tasks (
  task_id          integer generated always as identity primary key,
  project_id       integer not null references projects(project_id) on delete cascade,
  team_id          integer not null references teams(team_id),
  assignee_user_id integer references users(user_id) on delete set null,
  task_title       varchar(200) not null,
  task_description text,
  task_status      varchar(20) not null default 'TODO'
    check (task_status in ('TODO','IN_PROGRESS','DONE','BLOCKED')),
  task_priority    varchar(10) not null default 'MEDIUM'
    check (task_priority in ('LOW','MEDIUM','HIGH','URGENT')),
  task_due_date    date,
  task_progress    integer not null default 0
    check (task_progress between 0 and 100)
);
create index if not exists idx_tasks_project   on tasks(project_id);
create index if not exists idx_tasks_team      on tasks(team_id);
create index if not exists idx_tasks_assignee  on tasks(assignee_user_id);
create index if not exists idx_tasks_status    on tasks(task_status);

-- 9) TASK TODOS
create table if not exists task_todos (
  task_todo_id       integer generated always as identity primary key,
  task_id            integer not null references tasks(task_id) on delete cascade,
  assignee_user_id   integer references users(user_id) on delete set null,
  task_todo_title    varchar(200) not null,
  task_todo_status   varchar(10) not null default 'TODO'
    check (task_todo_status in ('TODO','DOING','DONE')),
  task_todo_evidence text,
  task_todo_due_date date
);
create index if not exists idx_todos_task     on task_todos(task_id);
create index if not exists idx_todos_assignee on task_todos(assignee_user_id);
```

---

## B. Halaman & Fitur

### 1. **Login**

* Form login → verifikasi email & password ke tabel `users`.
* Redirect ke Dashboard jika sukses, tampilkan error jika gagal.

### 2. **Dashboard**

* Ringkasan proyek → daftar project aktif, progress %, overdue, due terdekat.
* Ringkasan tugas saya → semua task/todo yang di-assign ke user.

### 3. **Users (Admin)**

* Tambah user → buat akun baru dengan nama, email, password, system role.
* Daftar & edit user → update info user, ganti role, nonaktifkan.
* Cari & filter user → berdasarkan nama/role.

### 4. **Teams (Admin & PM)**

* Buat tim → buat grup kerja baru.
* Kelola anggota → tambah/hapus user dari tim, tentukan role (PM/Staff) & job role.
* Kaitkan project → hubungkan tim ke project.

### 5. **Projects (Admin & PM)**

* Buat project → input nama, deskripsi, deadline.
* Daftar & edit project → lihat semua project, edit, arsipkan.
* Hubungkan tim → assign tim yang ikut mengerjakan project.

### 6. **Project Detail (PM & Staff)**

* Kanban board → task per status (`TODO/IN_PROGRESS/DONE/BLOCKED`), drag-n-drop.
* Quick add task → tambah task cepat langsung di board.
* Filter & search → saring task berdasarkan tim, assignee, status, priority, due date.

### 7. **Task Detail**

* Info task → detail lengkap (judul, deskripsi, status, priority, due, team, assignee).
* Checklist todos → buat sub-task/todo, assign ke staff, update status.
* Progress & evidence → update progress % dan tambah bukti/link di todo.

### 8. **My Tasks (Staff)**

* Daftar tugas saya → semua task & todo user.
* Update cepat → ubah status, due date, progress langsung dari list.

### 9. **Settings (Admin)**

* Kelola job roles → tambah/hapus job role (designer, marketing, developer, dll).
* Preferensi dasar → atur default (priority, overdue indicator).

### 10. **Reports (PM & Admin, opsional)**

* Overdue & due soon → laporan task menumpuk & mendekati tenggat.
* Progress per project → persentase progress & status ringkas.

---

