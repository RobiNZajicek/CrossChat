'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StreamDashboard } from "@/components/stream-dashboard";
import { DashboardOverview } from "@/components/dashboard-overview";

type UserData = {
  id: string;
  username: string;
  activeSessionId?: string;
  stats?: {
    totalMessages: number;
    totalStreams: number;
    lastViewCount: number;
  };
  subscriberCounts?: Record<string, number>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data);
      // If user has active session, they're streaming
      if (data.activeSessionId) {
        setIsStreaming(true);
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleStartStream = () => {
    setIsStreaming(true);
  };

  const handleEndStream = () => {
    setIsStreaming(false);
    fetchUserData(); // Refresh stats
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-white/50">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If streaming, show the stream dashboard
  if (isStreaming) {
    return (
      <div className="min-h-screen bg-[#050505] p-4 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Stream</h1>
              <p className="text-white/50">
                Streaming as <span className="text-orange-400 font-medium">{user.username}</span>
              </p>
            </div>
            <button
              onClick={() => setIsStreaming(false)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              ← Back to Overview
            </button>
          </header>
          <StreamDashboard 
            streamerId={user.id} 
            onStreamEnd={handleEndStream}
          />
        </div>
      </div>
    );
  }

  // Show overview
  return (
    <DashboardOverview 
      user={user}
      onStartStream={handleStartStream}
      onViewHistory={() => setIsStreaming(true)}
      onLogout={handleLogout}
    />
  );
}
