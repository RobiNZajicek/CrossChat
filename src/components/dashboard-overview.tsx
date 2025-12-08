'use client';

import { useEffect, useState } from "react";
import { 
  Play, 
  History, 
  Users, 
  MessageSquare, 
  Eye, 
  TrendingUp,
  Twitch,
  Youtube,
  Facebook,
  Music2,
  MessageCircle,
  Tv,
  Radio,
  LogOut,
  BarChart3,
  Calendar,
  Sparkles,
  Send,
  Search,
  Bell,
  ChevronDown,
  Zap,
  Clock,
  ArrowUpRight,
  Activity
} from "lucide-react";
import type { ProducerPlatform } from "@/types/chat";

// =============================================================================
// PLATFORM CONFIG
// =============================================================================
const PLATFORM_ICONS: Record<ProducerPlatform, { icon: React.ElementType; color: string; bg: string; gradient: string }> = {
  Twitch: { icon: Twitch, color: "text-purple-400", bg: "bg-purple-500/10", gradient: "from-purple-500 to-purple-600" },
  YouTube: { icon: Youtube, color: "text-red-400", bg: "bg-red-500/10", gradient: "from-red-500 to-red-600" },
  Kick: { icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", gradient: "from-emerald-500 to-emerald-600" },
  Facebook: { icon: Facebook, color: "text-blue-400", bg: "bg-blue-500/10", gradient: "from-blue-500 to-blue-600" },
  TikTok: { icon: Music2, color: "text-pink-400", bg: "bg-pink-500/10", gradient: "from-pink-500 to-pink-600" },
  Discord: { icon: MessageCircle, color: "text-indigo-400", bg: "bg-indigo-500/10", gradient: "from-indigo-500 to-indigo-600" },
  Bilibili: { icon: Tv, color: "text-cyan-400", bg: "bg-cyan-500/10", gradient: "from-cyan-500 to-cyan-600" },
  X: { icon: MessageSquare, color: "text-gray-300", bg: "bg-gray-500/10", gradient: "from-gray-500 to-gray-600" },
  Trovo: { icon: Radio, color: "text-teal-400", bg: "bg-teal-500/10", gradient: "from-teal-500 to-teal-600" },
};

type UserStats = {
  totalMessages: number;
  totalStreams: number;
  lastViewCount: number;
};

type Session = {
  id: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
};

interface Props {
  user: {
    id: string;
    username: string;
    stats?: UserStats;
    subscriberCounts?: Record<string, number>;
  };
  onStartStream: () => void;
  onViewHistory: () => void;
  onLogout: () => void;
}

// =============================================================================
// DASHBOARD OVERVIEW
// =============================================================================
export function DashboardOverview({ user, onStartStream, onViewHistory, onLogout }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch("/api/stream/sessions")
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = user.stats || { totalMessages: 0, totalStreams: 0, lastViewCount: 0 };
  const subCounts = user.subscriberCounts || {};
  const recentSessions = sessions.slice(0, 4);
  const totalSubs = Object.values(subCounts).reduce((a, b) => a + b, 0);

  // Generate fake chart data
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(Math.random() * 80) + 20,
  }));

  // Generate heatmap data (7 days x 24 hours)
  const heatmapData = Array.from({ length: 7 }, () => 
    Array.from({ length: 24 }, () => Math.random())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">Cross<span className="text-orange-400">Chat</span></span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <NavTab active>Dashboard</NavTab>
              <NavTab>Analytics</NavTab>
              <NavTab>Settings</NavTab>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Search size={14} className="text-white/40" />
              <input 
                placeholder="Search..." 
                className="bg-transparent text-sm text-white placeholder:text-white/40 w-32 focus:outline-none"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition">
              <Bell size={18} className="text-white/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                {user.username[0].toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-white">{user.username}</span>
              <ChevronDown size={14} className="text-white/40" />
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1600px] p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Stream Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">
              Last updated: {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition text-sm"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
            <button
              onClick={onStartStream}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition"
            >
              <Play size={16} fill="white" />
              Go Live
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Analytics Chart */}
            <section className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Viewer Analytics</h2>
                  <p className="text-white/40 text-sm">Monthly overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium">
                    +24% vs last month
                  </span>
                </div>
              </div>
              
              {/* Fake Chart */}
              <div className="h-48 flex items-end gap-2">
                {chartData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-orange-500/20 to-orange-500/60 transition-all hover:from-orange-500/30 hover:to-orange-500/80"
                      style={{ height: `${data.value}%` }}
                    />
                    <span className="text-[10px] text-white/30">{data.month}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Assistant */}
            <section className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                  <p className="text-white/40 text-xs">Powered by GPT-4</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Online</span>
              </div>
              
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <p className="text-white/60 text-sm leading-relaxed">
                  👋 Hi {user.username}! Based on your recent streams, I noticed your peak engagement 
                  happens between <span className="text-purple-400">7-9 PM</span>. Consider scheduling 
                  your next stream during this window for maximum reach.
                </p>
              </div>
              
              <div className="flex gap-2">
                <input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask me anything about your stream..."
                  className="flex-1 bg-black/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:border-purple-500/50 focus:outline-none transition"
                />
                <button className="px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition">
                  <Send size={16} />
                </button>
              </div>
            </section>

            {/* Activity Heatmap */}
            <section className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Activity Heatmap</h2>
                  <p className="text-white/40 text-sm">Chat activity by hour</p>
                </div>
                <Activity size={20} className="text-white/20" />
              </div>
              
              <div className="space-y-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30 w-8">{day}</span>
                    <div className="flex-1 flex gap-0.5">
                      {heatmapData[dayIndex].map((value, hourIndex) => (
                        <div
                          key={hourIndex}
                          className="flex-1 h-4 rounded-sm transition-colors"
                          style={{
                            backgroundColor: value > 0.7 
                              ? 'rgba(249, 115, 22, 0.8)' 
                              : value > 0.4 
                                ? 'rgba(249, 115, 22, 0.4)' 
                                : value > 0.2 
                                  ? 'rgba(249, 115, 22, 0.15)'
                                  : 'rgba(255, 255, 255, 0.03)'
                          }}
                          title={`${day} ${hourIndex}:00 - ${(value * 100).toFixed(0)}% activity`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-white/30 w-8"></span>
                  <div className="flex-1 flex justify-between text-[9px] text-white/20">
                    <span>12am</span>
                    <span>6am</span>
                    <span>12pm</span>
                    <span>6pm</span>
                    <span>11pm</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform Distribution */}
            <section className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Platform Distribution</h2>
                  <p className="text-white/40 text-sm">{totalSubs.toLocaleString()} total subscribers</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {(Object.keys(PLATFORM_ICONS) as ProducerPlatform[]).slice(0, 5).map(platform => {
                  const config = PLATFORM_ICONS[platform];
                  const Icon = config.icon;
                  const count = subCounts[platform] || 0;
                  const percent = totalSubs > 0 ? Math.round((count / totalSubs) * 100) : 0;
                  
                  return (
                    <div 
                      key={platform}
                      className={`relative overflow-hidden rounded-xl ${config.bg} border border-white/5 p-4 group hover:scale-105 transition`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition`} />
                      <Icon size={24} className={`${config.color} mb-2`} />
                      <div className="text-xl font-bold text-white">{count}</div>
                      <div className="text-xs text-white/40">{platform}</div>
                      <div className={`absolute top-2 right-2 text-[10px] font-medium ${config.color}`}>
                        {percent}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={BarChart3}
                label="Total Streams"
                value={stats.totalStreams.toString()}
                change="+12%"
                color="purple"
              />
              <StatCard 
                icon={MessageSquare}
                label="Messages"
                value={stats.totalMessages.toLocaleString()}
                change="+24%"
                color="orange"
              />
              <StatCard 
                icon={Eye}
                label="Last Viewers"
                value={stats.lastViewCount.toLocaleString()}
                change="+8%"
                color="emerald"
              />
              <StatCard 
                icon={Users}
                label="Subscribers"
                value={totalSubs.toLocaleString()}
                change="+15%"
                color="blue"
              />
            </div>

            {/* Recent Streams */}
            <section className="rounded-2xl bg-[#111] border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Clock size={16} className="text-orange-400" />
                  Recent Streams
                </h2>
                <button 
                  onClick={onViewHistory}
                  className="text-xs text-orange-400 hover:text-orange-300 transition"
                >
                  View all
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-6 text-white/30 text-sm">Loading...</div>
              ) : recentSessions.length === 0 ? (
                <div className="text-center py-6">
                  <History size={24} className="mx-auto mb-2 text-white/20" />
                  <p className="text-white/30 text-sm">No streams yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map(session => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Calendar size={16} className="text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {new Date(session.startedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-white/40">
                            {session.messageCount} messages
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-white/20" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Connected Platforms */}
            <section className="rounded-2xl bg-[#111] border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-400" />
                  Platforms
                </h2>
              </div>
              
              <div className="space-y-2">
                {(Object.keys(PLATFORM_ICONS) as ProducerPlatform[]).map(platform => {
                  const config = PLATFORM_ICONS[platform];
                  const Icon = config.icon;
                  const count = subCounts[platform] || 0;
                  
                  return (
                    <div 
                      key={platform}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition"
                    >
                      <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <Icon size={16} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{platform}</div>
                        <div className="text-xs text-white/40">{count.toLocaleString()} subs</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Actions */}
            <button
              onClick={onViewHistory}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
            >
              <History size={16} />
              View Stream History
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-white/5 text-center text-white/20 text-sm">
          CrossChat © {new Date().getFullYear()} — Real-time Multi-Platform Chat Aggregator
        </footer>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================

function NavTab({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
      active 
        ? 'bg-white/10 text-white' 
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`}>
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, change, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: 'purple' | 'orange' | 'emerald' | 'blue';
}) {
  const colors = {
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  };

  return (
    <div className="rounded-xl bg-[#111] border border-white/5 p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color].bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={colors[color].text} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-white/40">{label}</span>
        <span className="text-[10px] text-emerald-400 font-medium">{change}</span>
      </div>
    </div>
  );
}
