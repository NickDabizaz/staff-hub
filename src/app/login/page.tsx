import LoginForm from "./components/LoginForm";

/**
 * Halaman login utama yang menampilkan form login kepada pengguna
 * Halaman ini merupakan entry point untuk proses autentikasi pengguna
 */
export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231e293b' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: "linear-gradient(to bottom, white, rgba(255, 255, 255, 0))",
          WebkitMaskImage: "linear-gradient(to bottom, white, rgba(255, 255, 255, 0))"
        }}
      />
      <LoginForm />
    </main>
  );
}