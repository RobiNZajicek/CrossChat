'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Check } from "lucide-react";

export default function RegisterPage() {
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

    if ((data.password as string).length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const body = await res.json();
        setError(body.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Unified chat from 9 platforms",
    "Real-time message sync",
    "Custom OBS overlays",
    "AI-powered moderation",
    "Stream analytics",
    "Lower donation fees"
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 items-center justify-center p-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="text-5xl font-bold text-white mb-6">
            Join Cross<span className="text-white/80">Chat</span>
          </div>
          <p className="text-xl text-white/80 mb-12 max-w-md">
            Start streaming with unified chat today. Free forever for basic features.
          </p>
          
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check size={14} />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create account</h1>
            <p className="mt-2 text-white/50">Get started with CrossChat for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Username</label>
              <input 
                name="username" 
                required 
                disabled={loading}
                minLength={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50" 
                placeholder="Choose a username"
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
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition disabled:opacity-50" 
                  placeholder="Create a password (min 6 chars)"
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-xs text-white/30 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
          
          <p className="mt-8 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
