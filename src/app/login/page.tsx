'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const body = await res.json();
        setError(body.error || "Login failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="mt-2 text-white/50">Sign in to access your streaming dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Username</label>
              <input 
                name="username" 
                required 
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50" 
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50" 
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-4 font-bold text-white transition hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium transition">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 items-center justify-center p-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative text-center">
          <div className="text-6xl font-bold text-white mb-4">
            Cross<span className="text-white/80">Chat</span>
          </div>
          <p className="text-xl text-white/80 max-w-md">
            All your platform chats unified into one beautiful stream
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {["Twitch", "YouTube", "Kick", "TikTok", "Facebook", "Discord"].map((p) => (
              <span key={p} className="px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm backdrop-blur">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
