import LoginForm from "./components/LoginForm";

/**
 * Halaman login utama yang menampilkan form login kepada pengguna
 * Halaman ini merupakan entry point untuk proses autentikasi pengguna
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}