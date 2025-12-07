'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(body.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition">
            <ArrowLeft size={14} />
            Back to home
          </Link>
          
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">CrossChat</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-white/50">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Username</label>
              <input 
                name="username" 
                required 
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 font-semibold text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <p className="text-center text-sm text-white/40 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-[#121212] relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        
        <div className="relative text-center px-12">
          <div className="text-6xl mb-6">🎮</div>
          <h2 className="text-3xl font-bold text-white mb-4">Unified Chat Experience</h2>
          <p className="text-white/50 max-w-md">
            Connect all your streaming platforms and manage your community from one beautiful dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
