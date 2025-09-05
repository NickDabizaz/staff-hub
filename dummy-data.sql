-- =========================================
-- Staff Hub - Dummy Data (PostgreSQL) [ROBUST: tanpa hard-coded ID]
-- Semua email menggunakan domain @staffhub.com
-- =========================================

-- 0) Hapus data lama (urut sesuai FK)
DELETE FROM task_todos;
DELETE FROM tasks;
DELETE FROM project_teams;
DELETE FROM projects;
DELETE FROM team_member_roles;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM job_roles;
DELETE FROM users;

-- 1) USERS
INSERT INTO users (user_name, user_email, user_password, user_system_role) VALUES
('Admin User', 'admin@staffhub.com', 'admin123', 'ADMIN'),
('Project Manager 1', 'pm1@staffhub.com', 'pm123', 'PM'),
('Project Manager 2', 'pm2@staffhub.com', 'pm123', 'PM'),
('Developer 1', 'dev1@staffhub.com', 'dev123', 'STAFF'),
('Developer 2', 'dev2@staffhub.com', 'dev123', 'STAFF'),
('Designer 1', 'design1@staffhub.com', 'design123', 'STAFF'),
('Designer 2', 'design2@staffhub.com', 'design123', 'STAFF'),
('QA Engineer 1', 'qa1@staffhub.com', 'qa123', 'STAFF'),
('QA Engineer 2', 'qa2@staffhub.com', 'qa123', 'STAFF'),
('Marketing 1', 'marketing1@staffhub.com', 'marketing123', 'STAFF'),
('Marketing 2', 'marketing2@staffhub.com', 'marketing123', 'STAFF');

-- 2) JOB ROLES
INSERT INTO job_roles (job_role_name) VALUES
('Frontend Developer'),
('Backend Developer'),
('UI/UX Designer'),
('QA Engineer'),
('DevOps Engineer'),
('Product Manager'),
('Marketing Specialist'),
('Content Writer'),
('Data Analyst'),
('System Administrator');

-- 3) TEAMS
INSERT INTO teams (team_name) VALUES
('Web Development Team'),
('Mobile Development Team'),
('Design Team'),
('QA Team'),
('DevOps Team'),
('Marketing Team'),
('Product Management Team');

-- 4) TEAM MEMBERS (tanpa ID angka)
-- Web Development Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Web Development Team'),
 (SELECT user_id FROM users WHERE user_email='pm1@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Web Development Team'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'STAFF');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Web Development Team'),
 (SELECT user_id FROM users WHERE user_email='dev2@staffhub.com'),
 'STAFF');

-- Mobile Development Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Mobile Development Team'),
 (SELECT user_id FROM users WHERE user_email='pm2@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Mobile Development Team'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'STAFF');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Mobile Development Team'),
 (SELECT user_id FROM users WHERE user_email='dev2@staffhub.com'),
 'STAFF');

-- Design Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Design Team'),
 (SELECT user_id FROM users WHERE user_email='pm1@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Design Team'),
 (SELECT user_id FROM users WHERE user_email='design1@staffhub.com'),
 'STAFF');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Design Team'),
 (SELECT user_id FROM users WHERE user_email='design2@staffhub.com'),
 'STAFF');

-- QA Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='QA Team'),
 (SELECT user_id FROM users WHERE user_email='pm2@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='QA Team'),
 (SELECT user_id FROM users WHERE user_email='qa1@staffhub.com'),
 'STAFF');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='QA Team'),
 (SELECT user_id FROM users WHERE user_email='qa2@staffhub.com'),
 'STAFF');

-- DevOps Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='DevOps Team'),
 (SELECT user_id FROM users WHERE user_email='pm1@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='DevOps Team'),
 (SELECT user_id FROM users WHERE user_email='dev2@staffhub.com'),
 'STAFF');

-- Marketing Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Marketing Team'),
 (SELECT user_id FROM users WHERE user_email='pm2@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Marketing Team'),
 (SELECT user_id FROM users WHERE user_email='marketing1@staffhub.com'),
 'STAFF');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Marketing Team'),
 (SELECT user_id FROM users WHERE user_email='marketing2@staffhub.com'),
 'STAFF');

-- Product Management Team
INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Product Management Team'),
 (SELECT user_id FROM users WHERE user_email='pm1@staffhub.com'),
 'PM');

INSERT INTO team_members (team_id, user_id, team_member_role) VALUES
((SELECT team_id FROM teams WHERE team_name='Product Management Team'),
 (SELECT user_id FROM users WHERE user_email='pm2@staffhub.com'),
 'STAFF');

-- 5) TEAM MEMBER ROLES (map via (team_name, user_email) -> team_member_id)
-- Helper subselect untuk mempersingkat
-- Fungsi mini: ambil team_member_id berdasarkan team & user
-- (Tetap pakai subselect inline untuk portabilitas)

-- Web Dev: PM1 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id
     FROM team_members tm
    WHERE tm.team_id = (SELECT team_id FROM teams WHERE team_name='Web Development Team')
      AND tm.user_id = (SELECT user_id FROM users WHERE user_email='pm1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- Web Dev: Dev1 -> Frontend Developer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id
     FROM team_members tm
    WHERE tm.team_id = (SELECT team_id FROM teams WHERE team_name='Web Development Team')
      AND tm.user_id = (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Frontend Developer')
);

-- Web Dev: Dev2 -> Backend Developer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id
     FROM team_members tm
    WHERE tm.team_id = (SELECT team_id FROM teams WHERE team_name='Web Development Team')
      AND tm.user_id = (SELECT user_id FROM users WHERE user_email='dev2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Backend Developer')
);

-- Mobile: PM2 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Mobile Development Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- Mobile: Dev1 -> Frontend Developer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Mobile Development Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='dev1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Frontend Developer')
);

-- Mobile: Dev2 -> Backend Developer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Mobile Development Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='dev2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Backend Developer')
);

-- Design: PM1 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Design Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- Design: Design1 -> UI/UX Designer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Design Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='design1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='UI/UX Designer')
);

-- Design: Design2 -> UI/UX Designer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Design Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='design2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='UI/UX Designer')
);

-- QA: PM2 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='QA Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- QA: QA1 -> QA Engineer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='QA Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='qa1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='QA Engineer')
);

-- QA: QA2 -> QA Engineer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='QA Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='qa2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='QA Engineer')
);

-- DevOps: PM1 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='DevOps Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- DevOps: Dev2 -> DevOps Engineer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='DevOps Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='dev2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='DevOps Engineer')
);

-- Marketing: PM2 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Marketing Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- Marketing: Marketing1 -> Marketing Specialist
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Marketing Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='marketing1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Marketing Specialist')
);

-- Marketing: Marketing2 -> Content Writer
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Marketing Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='marketing2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Content Writer')
);

-- Product Management Team: PM1 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Product Management Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm1@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- Product Management Team: PM2 -> Product Manager
INSERT INTO team_member_roles (team_member_id, job_role_id) VALUES (
  (SELECT tm.team_member_id FROM team_members tm
    WHERE tm.team_id=(SELECT team_id FROM teams WHERE team_name='Product Management Team')
      AND tm.user_id=(SELECT user_id FROM users WHERE user_email='pm2@staffhub.com')),
  (SELECT job_role_id FROM job_roles WHERE job_role_name='Product Manager')
);

-- 6) PROJECTS
INSERT INTO projects (project_name, project_description, project_deadline) VALUES
('Company Website Redesign', 'Complete redesign of the company website with modern UI/UX', '2024-12-31'),
('Mobile Banking App', 'Development of a secure mobile banking application', '2024-11-30'),
('E-commerce Platform', 'Building a scalable e-commerce platform for retail business', '2025-02-28'),
('Marketing Campaign Dashboard', 'Dashboard for tracking marketing campaign performance', '2024-10-15'),
('Internal HR System', 'Human resources management system for internal use', '2025-03-31');

-- 7) PROJECT TEAMS
-- Company Website Redesign: Web Dev, Design, QA
INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id   FROM teams    WHERE team_name='Web Development Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id   FROM teams    WHERE team_name='Design Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id   FROM teams    WHERE team_name='QA Team'));

-- Mobile Banking App: Mobile Dev, Design, QA, DevOps
INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id   FROM teams    WHERE team_name='Mobile Development Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id   FROM teams    WHERE team_name='Design Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id   FROM teams    WHERE team_name='QA Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id   FROM teams    WHERE team_name='DevOps Team'));

-- E-commerce Platform: Web Dev, Design, QA
INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='E-commerce Platform'),
 (SELECT team_id   FROM teams    WHERE team_name='Web Development Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='E-commerce Platform'),
 (SELECT team_id   FROM teams    WHERE team_name='Design Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='E-commerce Platform'),
 (SELECT team_id   FROM teams    WHERE team_name='QA Team'));

-- Marketing Campaign Dashboard: Marketing, Web Dev
INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Marketing Campaign Dashboard'),
 (SELECT team_id   FROM teams    WHERE team_name='Marketing Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Marketing Campaign Dashboard'),
 (SELECT team_id   FROM teams    WHERE team_name='Web Development Team'));

-- Internal HR System: Web Dev, Design, QA, Product Management
INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Internal HR System'),
 (SELECT team_id   FROM teams    WHERE team_name='Web Development Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Internal HR System'),
 (SELECT team_id   FROM teams    WHERE team_name='Design Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Internal HR System'),
 (SELECT team_id   FROM teams    WHERE team_name='QA Team'));

INSERT INTO project_teams (project_id, team_id) VALUES
((SELECT project_id FROM projects WHERE project_name='Internal HR System'),
 (SELECT team_id   FROM teams    WHERE team_name='Product Management Team'));

-- 8) TASKS
-- Company Website Redesign
INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id    FROM teams    WHERE team_name='Web Development Team'),
 (SELECT user_id    FROM users    WHERE user_email='dev1@staffhub.com'),
 'Homepage Design Implementation','Implement the homepage design using React and Tailwind CSS','IN_PROGRESS','HIGH','2024-08-30',60);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id    FROM teams    WHERE team_name='Design Team'),
 (SELECT user_id    FROM users    WHERE user_email='design1@staffhub.com'),
 'Create Wireframes for Product Pages','Design wireframes for product listing and detail pages','TODO','MEDIUM','2024-08-20',0);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id    FROM teams    WHERE team_name='Web Development Team'),
 (SELECT user_id    FROM users    WHERE user_email='dev2@staffhub.com'),
 'Backend API Development','Develop RESTful APIs for product data','IN_PROGRESS','HIGH','2024-09-15',40);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Company Website Redesign'),
 (SELECT team_id    FROM teams    WHERE team_name='QA Team'),
 (SELECT user_id    FROM users    WHERE user_email='qa1@staffhub.com'),
 'Homepage Testing','Perform functional and UI testing for homepage','TODO','MEDIUM','2024-09-10',0);

-- Mobile Banking App
INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id    FROM teams    WHERE team_name='Mobile Development Team'),
 (SELECT user_id    FROM users    WHERE user_email='dev1@staffhub.com'),
 'User Authentication Module','Implement secure user authentication with biometric support','TODO','HIGH','2024-09-30',0);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id    FROM teams    WHERE team_name='Design Team'),
 (SELECT user_id    FROM users    WHERE user_email='design2@staffhub.com'),
 'App UI Design','Design complete UI for all app screens','IN_PROGRESS','HIGH','2024-09-20',70);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Mobile Banking App'),
 (SELECT team_id    FROM teams    WHERE team_name='QA Team'),
 (SELECT user_id    FROM users    WHERE user_email='qa2@staffhub.com'),
 'Security Testing','Perform penetration testing and security audits','TODO','HIGH','2024-11-15',0);

-- E-commerce Platform
INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='E-commerce Platform'),
 (SELECT team_id    FROM teams    WHERE team_name='Web Development Team'),
 (SELECT user_id    FROM users    WHERE user_email='dev2@staffhub.com'),
 'Payment Gateway Integration','Integrate multiple payment gateways','TODO','HIGH','2024-10-30',0);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='E-commerce Platform'),
 (SELECT team_id    FROM teams    WHERE team_name='Design Team'),
 (SELECT user_id    FROM users    WHERE user_email='design1@staffhub.com'),
 'Shopping Cart UI/UX','Design and implement shopping cart interface','TODO','MEDIUM','2024-09-25',0);

-- Marketing Campaign Dashboard
INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Marketing Campaign Dashboard'),
 (SELECT team_id    FROM teams    WHERE team_name='Marketing Team'),
 (SELECT user_id    FROM users    WHERE user_email='marketing1@staffhub.com'),
 'Campaign Data Analysis','Analyze performance data from previous campaigns','DONE','MEDIUM','2024-08-10',100);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Marketing Campaign Dashboard'),
 (SELECT team_id    FROM teams    WHERE team_name='Web Development Team'),
 (SELECT user_id    FROM users    WHERE user_email='dev1@staffhub.com'),
 'Dashboard Frontend Development','Build dashboard UI with charts and analytics','IN_PROGRESS','HIGH','2024-09-30',50);

-- Internal HR System
INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Internal HR System'),
 (SELECT team_id    FROM teams    WHERE team_name='Web Development Team'),
 (SELECT user_id    FROM users    WHERE user_email='dev2@staffhub.com'),
 'Employee Profile Module','Develop employee profile management features','TODO','MEDIUM','2024-10-20',0);

INSERT INTO tasks (project_id, team_id, assignee_user_id, task_title, task_description, task_status, task_priority, task_due_date, task_progress) VALUES
((SELECT project_id FROM projects WHERE project_name='Internal HR System'),
 (SELECT team_id    FROM teams    WHERE team_name='Design Team'),
 (SELECT user_id    FROM users    WHERE user_email='design2@staffhub.com'),
 'HR Dashboard Design','Create dashboard design for HR metrics','TODO','MEDIUM','2024-09-15',0);

-- 9) TASK TODOS
-- Homepage Design Implementation
INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Homepage Design Implementation'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Setup React project structure','DONE','Project structure created and committed to repo','2024-08-15');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Homepage Design Implementation'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Implement responsive navigation','DONE','Navigation component completed','2024-08-18');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Homepage Design Implementation'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Create homepage hero section','DOING','Hero section 70% complete','2024-08-25');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Homepage Design Implementation'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Integrate with backend API','TODO',NULL,'2024-08-30');

-- App UI Design
INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='App UI Design'),
 (SELECT user_id FROM users WHERE user_email='design2@staffhub.com'),
 'Create user persona documents','DONE','3 personas created and reviewed','2024-08-20');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='App UI Design'),
 (SELECT user_id FROM users WHERE user_email='design2@staffhub.com'),
 'Design login and signup screens','DONE','Screens designed and approved','2024-08-25');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='App UI Design'),
 (SELECT user_id FROM users WHERE user_email='design2@staffhub.com'),
 'Design main dashboard layout','DOING','Dashboard wireframe complete','2024-09-05');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='App UI Design'),
 (SELECT user_id FROM users WHERE user_email='design2@staffhub.com'),
 'Create interactive prototype','TODO',NULL,'2024-09-20');

-- Dashboard Frontend Development
INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Dashboard Frontend Development'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Setup charting library','DONE','Chart.js integrated successfully','2024-08-25');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Dashboard Frontend Development'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Implement data filtering component','DONE','Filtering component working','2024-09-01');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Dashboard Frontend Development'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Create campaign performance charts','DOING','Bar charts 80% complete','2024-09-20');

INSERT INTO task_todos (task_id, assignee_user_id, task_todo_title, task_todo_status, task_todo_evidence, task_todo_due_date) VALUES
((SELECT task_id FROM tasks WHERE task_title='Dashboard Frontend Development'),
 (SELECT user_id FROM users WHERE user_email='dev1@staffhub.com'),
 'Add export functionality','TODO',NULL,'2024-09-30');
