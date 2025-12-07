'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Loader2, Check } from "lucide-react";

export default function RegisterPage() {
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/login");
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
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-[#121212] relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        
        <div className="relative px-12">
          <div className="text-6xl mb-8">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-6">Start Streaming Smarter</h2>
          
          <ul className="space-y-4">
            {[
              "Unified chat from Twitch, YouTube & Kick",
              "Real-time analytics dashboard",
              "Stream session history & archives",
              "Custom badges for VIPs, Mods & Subs"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-white/70">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20">
                  <Check size={12} className="text-orange-400" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Right Side - Form */}
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
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/50">Join thousands of streamers already using CrossChat</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Username</label>
              <input 
                name="username" 
                required 
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                placeholder="Choose a username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                placeholder="Create a password (min 6 characters)"
              />
              <p className="text-xs text-white/30">Must be at least 6 characters</p>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            
            <p className="text-xs text-white/30 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
          
          <p className="text-center text-sm text-white/40 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
