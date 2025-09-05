# Staff Hub Coding Standards

This document outlines the coding standards and best practices for the Staff Hub project. All contributors should follow these guidelines to maintain code quality and consistency.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Code Organization](#code-organization)
4. [Naming Conventions](#naming-conventions)
5. [Component Development](#component-development)
6. [TypeScript Guidelines](#typescript-guidelines)
7. [Styling](#styling)
8. [Testing](#testing)
9. [Git Workflow](#git-workflow)
10. [Performance Considerations](#performance-considerations)
11. [Security Practices](#security-practices)

## Project Overview

Staff Hub is a Next.js 15 application built with TypeScript, React 19, Tailwind CSS, and Supabase. It serves as a task management platform for staff members.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Backend**: Supabase
- **UI Components**: Radix UI, Lucide React Icons
- **Form Validation**: Zod
- **Date Handling**: date-fns
- **Linting**: ESLint with Next.js Core Web Vitals

## Code Organization

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin-specific pages
│   ├── login/             # Authentication pages
│   ├── logout/            # Logout functionality
│   ├── projects/          # Project-related pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Shared components
│   ├── ui/                # Reusable UI components
│   ├── user/              # User-related components
│   └── Navbar.tsx         # Navigation component
├── lib/                   # Utility functions and helpers
└── types/                 # TypeScript type definitions
```

### File Naming Conventions

- Use `PascalCase` for component files (e.g., `Button.tsx`, `UserCard.tsx`)
- Use `camelCase` for utility files (e.g., `apiClient.ts`, `dateHelpers.ts`)
- Use `kebab-case` for CSS files (e.g., `global.css`, `dashboard-layout.css`)

## Naming Conventions

### Variables and Functions

- Use `camelCase` for variables and functions
- Use descriptive names that clearly indicate the purpose
- Boolean variables should be prefixed with `is`, `has`, `can`, etc.

```typescript
// Good
const isLoading = true;
const hasPermission = false;
const userList = [];

// Avoid
const loading = true;
const perm = false;
const list = [];
```

### Components

- Use `PascalCase` for component names
- Component names should be descriptive and specific
- Use JSX components for UI elements

```typescript
// Good
function UserCard() { ... }
function ProjectList() { ... }

// Avoid
function Card() { ... }
function List() { ... }
```

### Constants

- Use `UPPER_SNAKE_CASE` for constants

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

## Component Development

### Component Structure

Components should follow this structure:

1. Imports
2. Type definitions
3. Main component function
4. Export statement

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  name: string;
  email: string;
  isActive: boolean;
}

export function UserCard({ name, email, isActive }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={isActive ? 'active' : 'inactive'}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
```

### Props

- Always define prop types using TypeScript interfaces
- Use optional props with default values when appropriate
- Destructure props in the function parameters

### Component Best Practices

- Keep components small and focused on a single responsibility
- Prefer functional components over class components
- Use React hooks for state and side effects
- Extract complex logic into custom hooks when needed
- Avoid inline functions in render; define them outside or use `useCallback`

## TypeScript Guidelines

### Type Definitions

- Define types in the same file when they're only used in that file
- Create shared type files in `src/types/` for types used across multiple files
- Use interfaces for object shapes and types for unions/primitives
- Use `type` for complex types, unions, and intersections

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

type Status = 'pending' | 'approved' | 'rejected';

// Avoid
type User = {
  id: string;
  name: string;
  email: string;
};
```

### Strict Typing

- Enable strict mode in TypeScript (`strict: true` in `tsconfig.json`)
- Avoid using `any` type; use `unknown` instead when the type is truly unknown
- Use generics when creating reusable functions/components

### Optional Properties

- Use `?` for optional properties
- Provide default values for optional props in components

```typescript
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ 
  label, 
  variant = 'primary', 
  onClick = () => {} 
}: ButtonProps) {
  // Implementation
}
```

## Styling

### Tailwind CSS

- Use Tailwind utility classes for styling
- Prefer utility classes over custom CSS when possible
- Use `clsx` or `tailwind-merge` for conditional classes

```tsx
import clsx from 'clsx';

function Button({ variant, className }: ButtonProps) {
  return (
    <button 
      className={clsx(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
    >
      Click me
    </button>
  );
}
```

### Custom CSS

- When utility classes aren't sufficient, use CSS modules
- Avoid global CSS except for base styles in `globals.css`
- Use CSS variables for consistent theming



## Performance Considerations

### Component Optimization

- Use `React.memo()` for components that render frequently
- Implement `useMemo` and `useCallback` for expensive calculations
- Use dynamic imports for code splitting

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'));

// In component render
{showHeavyComponent && <HeavyComponent />}
```

### Data Fetching

- Use Next.js data fetching methods appropriately
- Implement proper loading states
- Handle errors gracefully
- Cache data when appropriate to reduce API calls

### Bundle Optimization

- Analyze bundle size regularly
- Use code splitting for large dependencies
- Remove unused dependencies
- Lazy load components when possible

## Security Practices

### Authentication

- Never store sensitive information in localStorage
- Use secure, HTTP-only cookies for session management
- Implement proper authentication checks on both client and server

### Data Handling

- Sanitize user inputs to prevent XSS attacks
- Validate data on both client and server
- Use parameterized queries to prevent SQL injection

### Environment Variables

- Store secrets in environment variables
- Prefix client-side variables with `NEXT_PUBLIC_` only when necessary
- Never commit secrets to version control

### Dependencies

- Regularly update dependencies
- Audit dependencies for security vulnerabilities
- Use trusted sources for packages

## Code Quality Tools

### ESLint

- Run `npm run lint` to check for code issues
- Fix all ESLint errors before committing
- Configure project-specific rules in `.eslintrc`

### TypeScript

- Ensure no TypeScript errors before committing
- Use strict typing options
- Regularly update TypeScript version

### Formatting

- Use Prettier for code formatting consistency
- Configure editor to format on save
- Resolve formatting conflicts with ESLint rules

## Review Process

1. All code must be reviewed before merging
2. Reviewers should check for:
   - Code quality and readability
   - Performance considerations
   - Security implications
   - Adherence to these standards
3. Address all review comments before merging
4. Run all tests locally before requesting review

## Continuous Improvement

These standards should evolve with the project. When proposing changes:

1. Discuss with the team
2. Update this document
3. Ensure all team members are aware of changes
4. Update any linting or formatting tools as needed