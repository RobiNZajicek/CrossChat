'use client';

import { useEffect, useState } from 'react';
import { 
  Play, 
  History, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Eye,
  Twitch,
  Youtube,
  MessageCircle,
  Clock,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  BarChart3,
  Zap,
  AlertCircle,
  Send,
  Radio,
  Facebook,
  Music2,
  Gamepad2,
  Twitter,
  Tv
} from 'lucide-react';

type Session = {
  id: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  messagesFile: string;
};

type UserStats = {
  totalMessages: number;
  totalStreams: number;
  lastViewCount?: number;
  subscriberCounts?: {
    twitch: number;
    youtube: number;
    kick: number;
    facebook: number;
    tiktok: number;
    discord: number;
    bilibili: number;
    x: number;
    trovo: number;
  };
};

type Props = {
  username: string;
  userId: string;
  stats?: UserStats;
  onStartStream: () => void;
  onViewHistory: () => void;
  isStreaming: boolean;
};

export function DashboardOverview({ username, userId, stats, onStartStream, onViewHistory, isStreaming }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [aiInput, setAiInput] = useState('');

  useEffect(() => {
    fetch('/api/stream/sessions')
      .then(res => res.json())
      .then(data => setSessions(data.sessions?.slice(0, 5) || []));
  }, []);

  const tabs = ['Dashboard', 'Analytics', 'History', 'Settings'];
  
  // Generate fake heatmap data for activity
  const generateHeatmap = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const hours = ['00-06 AM', '06-12 PM', '12-06 PM', '06-12 AM'];
    return { days, hours };
  };
  
  const heatmap = generateHeatmap();

  // Platform distribution for pie chart simulation
  const platforms = [
    { name: 'Twitch', percent: 25, color: '#a855f7', icon: Twitch },
    { name: 'YouTube', percent: 20, color: '#ef4444', icon: Youtube },
    { name: 'Kick', percent: 12, color: '#10b981', icon: MessageCircle },
    { name: 'Facebook', percent: 10, color: '#3b82f6', icon: Facebook },
    { name: 'TikTok', percent: 15, color: '#ec4899', icon: Music2 },
    { name: 'Discord', percent: 8, color: '#6366f1', icon: Gamepad2 },
    { name: 'Bilibili', percent: 5, color: '#06b6d4', icon: Tv },
    { name: 'X', percent: 3, color: '#6b7280', icon: Twitter },
    { name: 'Trovo', percent: 2, color: '#14b8a6', icon: Radio },
  ];

  const totalSubs = (stats?.subscriberCounts?.twitch || 0) + 
                   (stats?.subscriberCounts?.youtube || 0) + 
                   (stats?.subscriberCounts?.kick || 0);

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between border-b border-white/5 bg-[#1a1a1a] px-6 py-3">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <MessageSquare size={16} className="text-white" />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition">
            <Search size={18} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-white">{username}</div>
              <div className="text-xs text-white/40">{username}@crosschat.io</div>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Stream Dashboard</h1>
            <p className="text-white/40 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition">
              <Clock size={14} />
              Last 30 days
              <ChevronDown size={14} />
            </button>
            <button
              onClick={onStartStream}
              disabled={isStreaming}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            >
              <Radio size={14} />
              {isStreaming ? 'Live Now' : 'Go Live'}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Analytics Chart */}
            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-orange-400 font-medium mb-1">Analytics</div>
                  <h2 className="text-lg font-bold text-white">Tracking your streams</h2>
                </div>
                <div className="flex items-center gap-2">
                  {['Twitch', 'YouTube', 'All'].map((filter, idx) => (
                    <button
                      key={filter}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        idx === 2
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="relative">
                <div className="flex items-end justify-between gap-4 h-48 px-4">
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-white/30 pr-4">
                    <span>$60k</span>
                    <span>$40k</span>
                    <span>$20k</span>
                    <span>$0</span>
                  </div>
                  <div className="flex items-end gap-3 flex-1 ml-10">
                    {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88].map((height, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className={`w-full rounded-t-md transition-all ${
                            idx === 9 ? 'bg-gradient-to-t from-orange-600 to-orange-400' : 'bg-orange-500/30'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-4 ml-10 text-xs text-white/30">
                  {['5', '10', '15', '20', '25', '30'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                
                {/* Floating stat */}
                <div className="absolute top-4 left-16 rounded-xl bg-[#252525] border border-white/10 p-3 shadow-xl">
                  <div className="text-xs text-white/50 mb-1">Total Messages</div>
                  <div className="text-xl font-bold text-white">{(stats?.totalMessages || 0).toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                    <TrendingUp size={12} />
                    +24% this month
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* AI Assistant Box */}
              <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-6">
                <div className="mb-4">
                  <div className="text-xs text-white/40 mb-1">Hi {username}</div>
                  <h3 className="text-lg font-bold text-white">Can I help you?</h3>
                </div>
                
                <div className="space-y-2 mb-4">
                  {[
                    { icon: BarChart3, label: 'Stream analytics', color: 'bg-blue-500/20 text-blue-400' },
                    { icon: Zap, label: 'Top performers', color: 'bg-orange-500/20 text-orange-400' },
                    { icon: AlertCircle, label: 'Low engagement alerts', color: 'bg-white/5 text-white/50' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition hover:opacity-80 ${item.color}`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 rounded-xl bg-[#252525] border border-white/10 p-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask something to AI"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none px-2"
                  />
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition">
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-6">
                <div className="mb-4">
                  <div className="text-xs text-white/40 mb-1">Platform Stats</div>
                  <h3 className="text-lg font-bold text-white">Audience Split</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Pie Chart Placeholder */}
                  <div className="relative h-28 w-28 shrink-0">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#252525" strokeWidth="15" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="15" strokeDasharray={`${53 * 2.51} 251`} strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="15" strokeDasharray={`${32 * 2.51} 251`} strokeDashoffset={`${-53 * 2.51}`} />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="15" strokeDasharray={`${15 * 2.51} 251`} strokeDashoffset={`${-(53 + 32) * 2.51}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-xl font-bold text-white">{totalSubs}</div>
                      <div className="text-[10px] text-white/40">Total</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {platforms.map((p) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-xs text-white/60">{p.name}</span>
                        </div>
                        <span className="text-xs font-medium text-white">{p.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">Time Analysis</div>
                  <h3 className="text-lg font-bold text-white">Stream Activity</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">+{stats?.totalStreams || 0}</div>
                    <div className="text-xs text-white/40">Streams this month</div>
                  </div>
                  <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/10 transition">
                    Weekly
                    <ChevronDown size={12} />
                  </button>
                </div>
              </div>
              
              {/* Heatmap Grid */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 text-xs text-white/30">
                  {heatmap.hours.map((h) => (
                    <div key={h} className="h-8 flex items-center">{h}</div>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-7 gap-1">
                    {heatmap.hours.flatMap((_, hIdx) =>
                      heatmap.days.map((_, dIdx) => {
                        const intensity = Math.random();
                        return (
                          <div
                            key={`${hIdx}-${dIdx}`}
                            className={`h-8 rounded-md transition hover:ring-2 hover:ring-orange-500/50 ${
                              intensity > 0.7
                                ? 'bg-orange-500'
                                : intensity > 0.4
                                ? 'bg-orange-500/50'
                                : intensity > 0.2
                                ? 'bg-orange-500/20'
                                : 'bg-[#252525]'
                            }`}
                          />
                        );
                      })
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-white/30">
                    {heatmap.days.map((d) => (
                      <span key={d} className="w-full text-center">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button className="mt-4 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
                Create report
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Streams', value: stats?.totalStreams || 0, change: '+12%', color: 'emerald', icon: Radio },
                { label: 'Total Messages', value: stats?.totalMessages || 0, change: '+24%', color: 'orange', icon: MessageSquare },
                { label: 'Unique Viewers', value: stats?.lastViewCount || 0, change: '-5%', color: 'red', icon: Eye },
                { label: 'Active Subs', value: totalSubs, change: '+18%', color: 'emerald', icon: Users },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      stat.color === 'emerald' ? 'bg-emerald-500/10' : stat.color === 'orange' ? 'bg-orange-500/10' : 'bg-red-500/10'
                    }`}>
                      <stat.icon size={18} className={
                        stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'orange' ? 'text-orange-400' : 'text-red-400'
                      } />
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      stat.change.startsWith('+') 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.value.toLocaleString()}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity / Sessions */}
            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Recent Sessions</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Categories</span>
                  <ChevronDown size={12} className="text-white/40" />
                </div>
              </div>
              
              {sessions.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 mx-auto mb-3">
                    <History size={20} className="text-white/30" />
                  </div>
                  <p className="text-xs text-white/40">No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 4).map((session, idx) => (
                    <div key={session.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-bold">
                        #{sessions.length - idx}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          Stream Session
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        idx === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-white/5 text-white/40'
                      }`}>
                        {session.messageCount} msgs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Cards */}
            <div className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Connected Platforms</h3>
                <span className="text-xs text-white/40">9 platforms</span>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {[
                  { name: 'Twitch', icon: Twitch, color: '#a855f7', subs: stats?.subscriberCounts?.twitch || 0 },
                  { name: 'YouTube', icon: Youtube, color: '#ef4444', subs: stats?.subscriberCounts?.youtube || 0 },
                  { name: 'Kick', icon: MessageCircle, color: '#10b981', subs: stats?.subscriberCounts?.kick || 0 },
                  { name: 'Facebook', icon: Facebook, color: '#3b82f6', subs: stats?.subscriberCounts?.facebook || 0 },
                  { name: 'TikTok', icon: Music2, color: '#ec4899', subs: stats?.subscriberCounts?.tiktok || 0 },
                  { name: 'Discord', icon: Gamepad2, color: '#6366f1', subs: stats?.subscriberCounts?.discord || 0 },
                  { name: 'Bilibili', icon: Tv, color: '#06b6d4', subs: stats?.subscriberCounts?.bilibili || 0 },
                  { name: 'X', icon: Twitter, color: '#6b7280', subs: stats?.subscriberCounts?.x || 0 },
                  { name: 'Trovo', icon: Radio, color: '#14b8a6', subs: stats?.subscriberCounts?.trovo || 0 },
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#252525] border border-white/5 hover:border-white/10 transition">
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <platform.icon size={14} style={{ color: platform.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white">{platform.name}</div>
                      <div className="text-[10px] text-white/40">{platform.subs.toLocaleString()} subs</div>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Connected" />
                  </div>
                ))}
              </div>
            </div>

            {/* View History Button */}
            <button
              onClick={onViewHistory}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
            >
              <History size={16} />
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
