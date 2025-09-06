# Staff Hub Coding Standards

Dokumen ini berisi standar coding dan best practices untuk project Staff Hub. Semua kontributor harus mengikuti panduan ini untuk menjaga kualitas dan konsistensi kode.

## Daftar Isi

1. [Overview Project](#overview-project)
2. [Technology Stack](#technology-stack)
3. [Organisasi Kode](#organisasi-kode)
4. [Konvensi Penamaan](#konvensi-penamaan)
5. [Pengembangan Komponen](#pengembangan-komponen)
6. [Panduan TypeScript](#panduan-typescript)
7. [Styling](#styling)
8. [Testing](#testing)
9. [Git Workflow](#git-workflow)
10. [Pertimbangan Performance](#pertimbangan-performance)
11. [Praktik Keamanan](#praktik-keamanan)

## Overview Project

Staff Hub adalah aplikasi Next.js 15 yang dibangun dengan TypeScript, React 19, Tailwind CSS, dan Supabase. Aplikasi ini berfungsi sebagai platform manajemen tugas untuk anggota staff dengan dua role utama: user biasa dan admin.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Bahasa**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Backend**: Supabase
- **UI Components**: Radix UI, Lucide React Icons
- **Form Validation**: Zod
- **Date Handling**: date-fns
- **Linting**: ESLint dengan Next.js Core Web Vitals
- **Notifications**: SweetAlert2

## Organisasi Kode

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Halaman khusus admin
│   │   ├── dashboard/     # Dashboard admin
│   │   ├── users/         # Manajemen users
│   │   ├── teams/         # Manajemen teams
│   │   ├── projects/      # Manajemen projects
│   │   └── settings/      # Pengaturan sistem
│   ├── login/             # Halaman autentikasi
│   ├── logout/            # Fungsi logout
│   ├── projects/         # Halaman project user
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (dashboard user)
├── components/            # Komponen shared
│   ├── ui/                # Komponen UI yang dapat digunakan ulang
│   ├── user/              # Komponen khusus user
│   └── Navbar.tsx         # Komponen navigasi
├── lib/                   # Fungsi utility dan helpers
└── types.ts               # Definisi tipe TypeScript
```

### Konvensi Penamaan File

- Gunakan `PascalCase` untuk file komponen (e.g., `Button.tsx`, `UserCard.tsx`)
- Gunakan `camelCase` untuk file utility (e.g., `apiClient.ts`, `dateHelpers.ts`)
- Gunakan `kebab-case` untuk file CSS (e.g., `global.css`, `dashboard-layout.css`)

## Konvensi Penamaan

### Variabel dan Fungsi

- Gunakan `camelCase` untuk variabel dan fungsi
- Gunakan nama yang deskriptif dan jelas menunjukkan tujuan
- Variabel boolean harus diawali dengan `is`, `has`, `can`, dll.

```typescript
// Baik
const isLoading = true;
const hasPermission = false;
const userList = [];

// Hindari
const loading = true;
const perm = false;
const list = [];
```

### Komponen

- Gunakan `PascalCase` untuk nama komponen
- Nama komponen harus deskriptif dan spesifik
- Gunakan komponen JSX untuk elemen UI

```typescript
// Baik
function UserCard() { ... }
function ProjectList() { ... }

// Hindari
function Card() { ... }
function List() { ... }
```

### Konstanta

- Gunakan `UPPER_SNAKE_CASE` untuk konstanta

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

## Pengembangan Komponen

### Struktur Komponen

Komponen harus mengikuti struktur berikut:

1. Imports
2. Definisi tipe
3. Fungsi komponen utama
4. Statement export

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

- Selalu definisikan tipe props menggunakan interface TypeScript
- Gunakan optional props dengan default values jika sesuai
- Destructure props dalam parameter fungsi

### Best Practices Komponen

- Jaga komponen tetap kecil dan fokus pada satu tanggung jawab
- Lebih suka functional components daripada class components
- Gunakan React hooks untuk state dan side effects
- Ekstrak logika kompleks ke custom hooks jika diperlukan
- Hindari inline functions dalam render; definisikan di luar atau gunakan `useCallback`

## Panduan TypeScript

### Definisi Tipe

- Definisikan tipe dalam file yang sama jika hanya digunakan di file tersebut
- Buat file tipe shared di `src/types.ts` untuk tipe yang digunakan di beberapa file
- Gunakan interface untuk bentuk objek dan type untuk unions/primitives
- Gunakan `type` untuk tipe kompleks, unions, dan intersections

```typescript
// Baik
interface User {
  id: string;
  name: string;
  email: string;
}

type Status = 'pending' | 'approved' | 'rejected';

// Hindari
type User = {
  id: string;
  name: string;
  email: string;
};
```

### Strict Typing

- Aktifkan strict mode di TypeScript (`strict: true` di `tsconfig.json`)
- Hindari menggunakan tipe `any`; gunakan `unknown` jika tipe benar-benar tidak diketahui
- Gunakan generics saat membuat fungsi/komponen yang dapat digunakan ulang

### Properti Optional

- Gunakan `?` untuk properti optional
- Berikan default values untuk optional props dalam komponen

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

- Gunakan utility classes Tailwind untuk styling
- Lebih suka utility classes daripada custom CSS jika memungkinkan
- Gunakan `clsx` atau `tailwind-merge` untuk conditional classes

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

### Design System Staff Hub

#### Color Palette
- **Primary**: `sky-500` (untuk buttons dan accents)
- **Background**: `slate-950` (main background)
- **Cards**: `slate-800/50` dengan border `slate-800`
- **Text Primary**: `white`
- **Text Secondary**: `slate-400`
- **Text Muted**: `slate-500`

#### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: `font-bold`
- **Body**: `font-medium` atau `font-normal`
- **Small text**: `text-sm` atau `text-xs`

#### Spacing & Layout
- **Container padding**: `p-6`
- **Card padding**: `p-4` atau `p-6`
- **Gap between elements**: `space-y-6` atau `gap-6`
- **Border radius**: `rounded-lg`

#### Interactive Elements
- **Hover states**: `hover:bg-slate-800`, `hover:text-sky-400`
- **Focus states**: `focus:ring-2 focus:ring-sky-500`
- **Transitions**: `transition-all duration-300`

### Custom CSS

- Gunakan CSS modules jika utility classes tidak cukup
- Hindari global CSS kecuali untuk base styles di `globals.css`
- Gunakan CSS variables untuk theming yang konsisten



## Pertimbangan Performance

### Optimisasi Komponen

- Gunakan `React.memo()` untuk komponen yang sering di-render
- Implementasikan `useMemo` dan `useCallback` untuk perhitungan yang mahal
- Gunakan dynamic imports untuk code splitting

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'));

// Dalam component render
{showHeavyComponent && <HeavyComponent />}
```

### Data Fetching

- Gunakan Next.js data fetching methods dengan tepat
- Implementasikan loading states yang proper
- Handle errors dengan baik
- Cache data jika sesuai untuk mengurangi API calls

### Bundle Optimization

- Analisis ukuran bundle secara berkala
- Gunakan code splitting untuk dependencies yang besar
- Hapus dependencies yang tidak digunakan
- Lazy load komponen jika memungkinkan

## Praktik Keamanan

### Autentikasi

- Jangan pernah menyimpan informasi sensitif di localStorage
- Gunakan secure, HTTP-only cookies untuk session management
- Implementasikan proper authentication checks di client dan server

### Penanganan Data

- Sanitasi user inputs untuk mencegah XSS attacks
- Validasi data di client dan server
- Gunakan parameterized queries untuk mencegah SQL injection

### Environment Variables

- Simpan secrets di environment variables
- Prefix client-side variables dengan `NEXT_PUBLIC_` hanya jika diperlukan
- Jangan pernah commit secrets ke version control

### Dependencies

- Update dependencies secara berkala
- Audit dependencies untuk security vulnerabilities
- Gunakan sumber terpercaya untuk packages

## Tools Kualitas Kode

### ESLint

- Jalankan `npm run lint` untuk mengecek masalah kode
- Perbaiki semua ESLint errors sebelum commit
- Konfigurasi project-specific rules di `.eslintrc`

### TypeScript

- Pastikan tidak ada TypeScript errors sebelum commit
- Gunakan strict typing options
- Update TypeScript version secara berkala

### Formatting

- Gunakan Prettier untuk konsistensi formatting kode
- Konfigurasi editor untuk format on save
- Resolve formatting conflicts dengan ESLint rules

## Proses Review

1. Semua kode harus di-review sebelum merging
2. Reviewer harus mengecek:
   - Kualitas kode dan readability
   - Pertimbangan performance
   - Implikasi keamanan
   - Kepatuhan terhadap standar ini
3. Address semua review comments sebelum merging
4. Jalankan semua tests lokal sebelum request review

## Continuous Improvement

Standar ini harus berkembang bersama project. Saat mengusulkan perubahan:

1. Diskusikan dengan tim
2. Update dokumen ini
3. Pastikan semua anggota tim aware dengan perubahan
4. Update linting atau formatting tools jika diperlukan