'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

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
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-[#0e0e10] p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-white/50">Login to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/60">Username</label>
              <input name="username" required className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60">Password</label>
              <input type="password" name="password" required className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 transition">
            Sign In
          </button>
        </form>
        
        <p className="text-center text-sm text-white/40">
          Don't have an account? <Link href="/register" className="text-indigo-400 hover:text-indigo-300">Register</Link>
        </p>
      </div>
    </div>
  );
}

