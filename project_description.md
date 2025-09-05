# Staff Hub - Project Management System

## Project Overview

Staff Hub is a comprehensive project management application built with Next.js that allows organizations to manage projects, teams, and tasks efficiently. The system has two primary user roles: regular users (staff) and administrators, each with different access levels and capabilities.

The application uses Supabase as its backend database and provides features such as project tracking, team management, task assignment through a Kanban board interface, and user administration.

## Pages and Features

### Authentication Pages

#### Login Page (`/login`)
- User authentication interface
- Form for entering email and password
- Redirects to appropriate dashboard based on user role after successful login

#### Logout Functionality (`/logout`)
- Clears user session
- Redirects to login page

### User Dashboard (`/`)

The main dashboard for regular users (non-admins) displays:
- Personalized welcome message with user's name
- List of projects assigned to the user's teams
- Project cards showing project name, description, and status
- Navigation to individual project details

### Project Detail Pages (`/projects/[id]`)

For each project, users can access:
- Project overview with name, description, and deadline
- Kanban board for task management with columns (To Do, In Progress, Done)
- Task creation functionality
- Task movement between columns
- Task details viewing and editing

### Admin Dashboard (`/admin`)

Administrators have access to a specialized dashboard with management sections:
- Dashboard overview
- User management
- Team management
- Project management
- System settings

#### Admin Users Management (`/admin/users`)
- View all registered users in the system
- Edit user details
- Assign user roles (regular user or admin)
- User data management interface

#### Admin Teams Management (`/admin/teams`)
- Create and manage teams
- Assign users to teams
- View team membership
- Edit team details

#### Admin Projects Management (`/admin/projects`)
- View all projects in the system
- Create new projects
- Assign projects to teams
- Edit project details (name, description, deadline)
- Project listing with team assignments

#### Admin Settings (`/admin/settings`)
- System configuration options
- Job role management
- Application preferences

## Key Features

### Role-Based Access Control
- Different experiences for regular users and administrators
- Access restrictions based on user role
- Secure routing to appropriate sections

### Project Management
- Project creation and editing
- Deadline tracking
- Project status monitoring
- Team assignment to projects

### Team Management
- Team creation and organization
- User assignment to teams
- Team membership management

### Task Management (Kanban Board)
- Visual task board with drag-and-drop functionality
- Task categorization (To Do, In Progress, Done)
- Task creation and editing
- Task assignment

### User Management
- User registration and authentication
- Role assignment (user/admin)
- Profile management

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Backend**: Supabase (database and authentication)
- **Validation**: Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: SweetAlert2

## Database Schema

The application uses a relational database structure with the following key entities:
- Users: System users with roles
- Teams: Groups of users working together
- Projects: Work initiatives with deadlines
- Project Teams: Junction table linking projects to teams
- Tasks: Individual work items within projects
- Team Members: Junction table linking users to teams