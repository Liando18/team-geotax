import { useState, FormEvent, useEffect } from "react";
import { Eye, EyeOff, LogIn, MapIcon } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
// import { useLoading } from "@/context/LoadingContext";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(false);
  const router = useRouter();
  //   const { setLoading } = useLoading();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.info("Anda sudah login!");
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password harus diisi");
      return;
    }

    // setLoading(true);
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberDevice }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Akses tidak valid", {
          description: "Silakan cek data anda",
          className: "bg-red-600 text-white border border-red-500",
          icon: "❌",
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login berhasil!");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      toast.error("Error: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-green-600 mb-4">
              <MapIcon size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              GeoTax Arutala
            </h1>
            <p className="text-slate-400">Selamat datang kembali team</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="rememberDevice"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="rememberDevice"
                className="ml-2 text-sm text-slate-400 cursor-pointer">
                Ingat perangkat saya
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold hover:from-blue-600 hover:to-green-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2025 GeoTax. All rights reserved.
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
