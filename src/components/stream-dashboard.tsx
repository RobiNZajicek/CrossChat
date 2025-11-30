'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { 
  BadgeCheck, 
  Crown, 
  Shield, 
  Twitch, 
  Youtube, 
  MessageCircle,
  Wifi,
  WifiOff,
  Activity,
  History,
  Play,
  Square
} from "lucide-react";
import type {
  ChatMessage,
  ProducerPayload,
  ProducerPlatform,
} from "@/types/chat";

const PLATFORM_CONFIG: Record<
  ProducerPlatform,
  {
    slug: string;
    accent: string;
    accentRing: string;
    tag: string;
    statusPill: string;
    gradient: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  Twitch: {
    slug: "twitch",
    accent: "text-purple-400",
    accentRing: "ring-purple-500/40",
    tag: "bg-purple-500/20 text-purple-200 border border-purple-500/30",
    statusPill: "bg-purple-500/15 text-purple-200",
    gradient: "from-purple-600/50 via-purple-500/20 to-transparent",
    description: "Twitch simulation with bits, subs, and hype trains.",
    icon: Twitch,
  },
  YouTube: {
    slug: "youtube",
    accent: "text-red-400",
    accentRing: "ring-red-500/40",
    tag: "bg-red-500/20 text-red-200 border border-red-500/30",
    statusPill: "bg-red-500/15 text-red-200",
    gradient: "from-red-600/50 via-red-500/20 to-transparent",
    description: "YouTube Live simulation with SuperChats and memberships.",
    icon: Youtube,
  },
  Kick: {
    slug: "kick",
    accent: "text-emerald-400",
    accentRing: "ring-emerald-500/40",
    tag: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
    statusPill: "bg-emerald-500/15 text-emerald-200",
    gradient: "from-emerald-600/50 via-emerald-500/20 to-transparent",
    description: "Kick simulation with raw, low-latency chat events.",
    icon: MessageCircle,
  },
};

type FormState = {
  user: string;
  text: string;
  isSending: boolean;
  isVip: boolean;
  isSub: boolean;
  isMod: boolean;
  color: string;
  status?: {
    tone: "success" | "error";
    message: string;
  };
};

const INITIAL_FORM: FormState = {
  user: "",
  text: "",
  isSending: false,
  isVip: false,
  isSub: false,
  isMod: false,
  color: "#ffffff",
};

const sortMessages = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => a.timestamp - b.timestamp).slice(-300);

interface Props {
  streamerId: string;
}

type Session = {
  id: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  messagesFile: string;
};

export function StreamDashboard({ streamerId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<ProducerPlatform>("Twitch");
  const [view, setView] = useState<"live" | "history">("live");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [forms, setForms] = useState<Record<ProducerPlatform, FormState>>({
    Twitch: { ...INITIAL_FORM },
    YouTube: { ...INITIAL_FORM },
    Kick: { ...INITIAL_FORM },
  });
  
  const feedRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (view !== "live") return;

    const initSocket = async () => {
      try {
        await fetch("/api/socket");
      } catch (e) {
        console.error("Failed to wake up socket server", e);
        setLastError("API Init Failed");
      }
    };

    initSocket().then(() => {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || undefined;
      const socket = io(socketUrl, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
        setSocketId(socket.id || null);
        setLastError(null);
        socket.emit("join", streamerId);
      });

      socket.on("reconnect", () => {
        socket.emit("join", streamerId);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        setSocketId(null);
      });

      socket.on("chat:message", (message: ChatMessage) => {
        handleIncomingMessage(message);
      });

      socket.on("chat:message:global", (message: ChatMessage) => {
        if (message.streamerId === streamerId) {
            handleIncomingMessage(message);
        }
      });
    });

    const handleIncomingMessage = (message: ChatMessage) => {
        if (message.streamerId && message.streamerId !== streamerId) return;

        setMessages((prev) => {
          if (messageIds.current.has(message.id)) {
            return prev;
          }
          messageIds.current.add(message.id);
          return sortMessages([...prev, message]);
        });
    };

    // Polling fallback every 2 seconds - ALWAYS run to ensure sync
    const pollInterval = setInterval(() => {
        fetchMessages();
    }, 2000);

    fetchMessages(); // Initial load

    return () => {
      socketRef.current?.disconnect();
      clearInterval(pollInterval);
    };
  }, [streamerId, view]);

  const fetchMessages = (archive?: string) => {
    let url = "/api/messages";
    if (archive) url += `?archive=${archive}`;

    fetch(url, { cache: "no-store" })
      .then(res => res.json())
      .then((data: { messages?: ChatMessage[] }) => {
        if (data.messages?.length) {
          if (archive) {
             setMessages(sortMessages(data.messages));
          } else {
             messageIds.current = new Set(data.messages.map((msg) => msg.id));
             setMessages(sortMessages(data.messages));
          }
        } else if (archive) {
            setMessages([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load history:", err);
      });
  };

  const loadSessions = () => {
      fetch("/api/stream/sessions")
        .then(res => res.json())
        .then(data => setSessions(data.sessions));
  };

  useEffect(() => {
      if (view === "history") {
          loadSessions();
          socketRef.current?.disconnect();
      }
  }, [view]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleControl = async (action: "start" | "end") => {
      await fetch("/api/stream/control", {
          method: "POST",
          body: JSON.stringify({ action })
      });
      if (action === "start") {
          setMessages([]);
          messageIds.current = new Set();
          fetchMessages(); // Refresh immediately after starting
      }
      if (action === "end") {
          setMessages([]);
      }
  };

  const handleInputChange = (
    platform: ProducerPlatform,
    field: keyof FormState,
    value: string | boolean,
  ) => {
    setForms((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
  };

  const handleSubmit = async (platform: ProducerPlatform) => {
    const form = forms[platform];
    if (!form.user.trim() || !form.text.trim()) return;

    const payload: ProducerPayload = {
      streamerId,
      user: form.user.trim(),
      text: form.text.trim(),
      isVip: form.isVip,
      isSub: form.isSub,
      isMod: form.isMod,
      color: form.color,
    };

    setForms((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], isSending: true },
    }));

    try {
      const res = await fetch(`/api/producers/${PLATFORM_CONFIG[platform].slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setForms((prev) => ({
        ...prev,
        [platform]: {
          ...INITIAL_FORM,
          user: prev[platform].user,
          color: prev[platform].color,
          isVip: prev[platform].isVip,
          isSub: prev[platform].isSub,
          isMod: prev[platform].isMod,
          status: { tone: "success", message: "Sent!" }
        },
      }));
      setTimeout(() => setForms(p => ({...p, [platform]: {...p[platform], status: undefined}})), 2000);
      
      // OPTIMISTIC UPDATE (Simulated)
      // Since we don't know the exact UUID the server will generate, we rely on the rapid polling or socket to confirm it.
      // But we can trigger a fetch immediately.
      setTimeout(() => fetchMessages(), 100); 

    } catch (error) {
      setForms((prev) => ({
        ...prev,
        [platform]: { 
          ...prev[platform], 
          isSending: false, 
          status: { tone: "error", message: error instanceof Error ? error.message : "Failed" } 
        },
      }));
    }
  };

  const activeForm = forms[activePlatform]; // Defined correctly here

  return (
    <div className="grid h-[calc(100vh-12rem)] gap-8 lg:grid-cols-[1fr_400px]">
      <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e0e10] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 bg-[#18181b] px-4 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {view === "live" ? "Live Feed" : "Stream Archive"}
            </h2>
            
            {view === "live" && (
                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                isConnected 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {isConnected ? "LIVE" : "OFFLINE"}
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setView("live")}
                className={`p-2 rounded-lg transition ${view === "live" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5"}`}
                title="Live View"
             >
                 <Activity size={16} />
             </button>
             <button 
                onClick={() => setView("history")}
                className={`p-2 rounded-lg transition ${view === "history" ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5"}`}
                title="History"
             >
                 <History size={16} />
             </button>
          </div>
        </div>
        
        {view === "live" ? (
            <div ref={feedRef} className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-white/30">
                <MessageCircle size={32} className="opacity-50" />
                <p className="text-sm">Waiting for chat...</p>
                </div>
            ) : (
                messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
                ))
            )}
            </div>
        ) : (
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/3 border-r border-white/5 overflow-y-auto p-2 space-y-1">
                    {sessions.length === 0 && <p className="text-center text-xs text-white/30 mt-4">No archives found.</p>}
                    {sessions.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => fetchMessages(s.messagesFile)}
                            className="w-full text-left p-3 rounded-lg hover:bg-white/5 text-xs transition"
                        >
                            <div className="font-bold text-white/80">Stream {new Date(s.startedAt).toLocaleDateString()}</div>
                            <div className="text-white/40">{new Date(s.startedAt).toLocaleTimeString()} • {s.messageCount} msgs</div>
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-black/20">
                    {messages.map((message) => (
                        <ChatMessageItem key={message.id} message={message} />
                    ))}
                </div>
            </div>
        )}
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-white/10 bg-[#18181b] p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Stream Controls</h3>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => handleControl("start")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                    <Play size={12} fill="currentColor" /> Start New Stream
                </button>
                <button 
                    onClick={() => handleControl("end")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                >
                    <Square size={12} fill="currentColor" /> End & Archive
                </button>
            </div>
        </section>

        <SimulatorPanel 
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            activeForm={activeForm}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
  const Config = PLATFORM_CONFIG[message.platform];
  const Icon = Config.icon;

  return (
    <div className="group flex items-start gap-2.5 rounded-lg border border-transparent px-3 py-1.5 transition-colors hover:border-white/5 hover:bg-white/[0.02]">
      <div className="mt-1 shrink-0 opacity-70" title={message.platform}>
        <Icon size={16} className={Config.accent} />
      </div>

      <div className="min-w-0 flex-1 leading-snug">
        <span className="inline-flex flex-wrap items-baseline gap-x-2 align-middle">
          <span 
            className="font-bold text-[13px] hover:underline cursor-pointer"
            style={{ color: message.color || '#fff' }}
          >
            {message.user}
          </span>

          {(message.isMod || message.isVip || message.isSub) && (
            <span className="inline-flex gap-1 self-center">
              {message.isMod && (
                <div className="rounded bg-green-500/20 p-0.5" title="Moderator">
                  <Shield size={11} className="fill-green-500 text-green-500" />
                </div>
              )}
              {message.isVip && (
                <div className="rounded bg-pink-500/20 p-0.5" title="VIP">
                  <Crown size={11} className="fill-pink-500 text-pink-500" />
                </div>
              )}
              {message.isSub && (
                <div className="rounded bg-blue-500/20 p-0.5" title="Subscriber">
                  <BadgeCheck size={11} className="fill-blue-500 text-blue-500" />
                </div>
              )}
            </span>
          )}

          <span className="text-white/40 text-[13px]">:</span>

          <span className="break-words text-[13px] text-white/90">
            {message.text}
          </span>
        </span>
      </div>
    </div>
  );
}

function SimulatorPanel({ 
  activePlatform, 
  setActivePlatform, 
  activeForm, 
  handleInputChange, 
  handleSubmit 
}: any) {
  return (
    <section className="flex flex-col rounded-xl border border-white/10 bg-[#18181b]">
      <div className="border-b border-white/5 p-2">
        <div className="flex gap-1">
          {Object.keys(PLATFORM_CONFIG).map((p) => {
            const platform = p as ProducerPlatform;
            const Icon = PLATFORM_CONFIG[platform].icon;
            const isActive = activePlatform === platform;
            return (
              <button
                key={platform}
                onClick={() => setActivePlatform(platform)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-white/40 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <Icon size={14} className={isActive ? PLATFORM_CONFIG[platform].accent : ""} />
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex-1 p-5">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${PLATFORM_CONFIG[activePlatform as ProducerPlatform].gradient} opacity-20`} />
        
        <div className="relative flex h-full flex-col gap-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">User Identity</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                placeholder="Username"
                value={activeForm.user}
                onChange={(e) => handleInputChange(activePlatform, "user", e.target.value)}
              />
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5">
                  <span className="text-[10px] text-white/40">Color</span>
                  <input
                    type="color"
                    value={activeForm.color}
                    onChange={(e) => handleInputChange(activePlatform, "color", e.target.value)}
                    className="h-5 w-6 cursor-pointer rounded bg-transparent p-0"
                  />
                </div>
                
                <div className="flex flex-1 gap-1">
                  {[
                    { key: "isMod", icon: Shield, label: "MOD", color: "text-green-400 border-green-500/50 bg-green-500/10" },
                    { key: "isVip", icon: Crown, label: "VIP", color: "text-pink-400 border-pink-500/50 bg-pink-500/10" },
                    { key: "isSub", icon: BadgeCheck, label: "SUB", color: "text-blue-400 border-blue-500/50 bg-blue-500/10" },
                  ].map(({ key, icon: Icon, label, color }) => (
                    <button
                      key={key}
                      onClick={() => handleInputChange(activePlatform, key, !activeForm[key])}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-all ${
                        activeForm[key]
                          ? color
                          : "border-white/5 bg-white/5 text-white/30 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={10} className={activeForm[key] ? "fill-current" : ""} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Message Content</label>
              <textarea
                className="h-32 w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                placeholder={`Type something in ${activePlatform} chat...`}
                value={activeForm.text}
                onChange={(e) => handleInputChange(activePlatform, "text", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(activePlatform);
                  }
                }}
              />
            </div>
          </div>

          <button
            onClick={() => handleSubmit(activePlatform)}
            disabled={activeForm.isSending}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
          >
            {activeForm.isSending ? "Processing..." : "Simulate Message"}
          </button>
        </div>
      </div>
    </section>
  );
}
