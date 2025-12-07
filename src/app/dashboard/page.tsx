'use client';

import { useEffect, useState } from "react";
import { DashboardOverview } from "@/components/dashboard-overview";
import { StreamDashboard } from "@/components/stream-dashboard";
import { ArrowLeft } from "lucide-react";

type User = {
  id: string;
  username: string;
  stats?: {
    totalMessages: number;
    totalStreams: number;
    lastViewCount?: number;
    subscriberCounts?: {
      twitch: number;
      youtube: number;
      kick: number;
    };
  };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'overview' | 'streaming' | 'history'>('overview');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Nacte user data ze session
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data.user);
          setIsStreaming(!!data.user.activeSessionId);
        }
      });
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  const handleStartStream = async () => {
    await fetch('/api/stream/control', {
      method: 'POST',
      body: JSON.stringify({ action: 'start' })
    });
    setIsStreaming(true);
    setView('streaming');
  };

  const handleBackToOverview = async () => {
    // Refresh user data
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setIsStreaming(!!data.user.activeSessionId);
    }
    setView('overview');
  };

  const handleStreamEnd = () => {
    setIsStreaming(false);
    handleBackToOverview();
  };

  return (
    <div className="min-h-screen bg-black">
      {view === 'overview' && (
        <DashboardOverview
          username={user.username}
          userId={user.id}
          stats={user.stats}
          onStartStream={handleStartStream}
          onViewHistory={() => setView('history')}
          isStreaming={isStreaming}
        />
      )}

      {(view === 'streaming' || view === 'history') && (
        <div className="min-h-screen bg-black p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={handleBackToOverview}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to Overview
              </button>
              <div className="text-white/40 text-sm">
                {view === 'streaming' ? 'Live Streaming Mode' : 'Stream History'}
              </div>
            </div>
            <StreamDashboard 
              streamerId={user.id} 
              defaultView={view === 'history' ? 'history' : 'live'}
              onStreamEnd={handleStreamEnd}
            />
          </div>
        </div>
      )}
    </div>
  );
}
