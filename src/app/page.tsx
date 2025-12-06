import Link from "next/link";
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  MessageSquare, 
  Users 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[#050505] py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]" />
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            v2.0 Now Available with Multi-Platform Support
          </div>
          <h1 className="mx-auto max-w-4xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
            Unify Your Stream Chat <br />
            <span className="text-white">Into One Feed</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
            Don't tab-switch between Twitch, YouTube, and Kick. 
            CrossChat aggregates millions of messages with zero latency using 
            advanced worker threads and mutex-guarded queues.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Start Streaming
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Why Streamers Choose CrossChat</h2>
            <p className="mt-4 text-white/50">Built for high-velocity chat environments.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Zero Latency",
                desc: "Powered by Node.js Worker Threads for non-blocking message processing."
              },
              {
                icon: Globe,
                title: "Universal Support",
                desc: "Seamlessly integrates with Twitch, YouTube Live, and Kick APIs."
              },
              {
                icon: ShieldCheck,
                title: "Thread Safe",
                desc: "Mutex-guarded shared memory prevents race conditions and data loss."
              },
              {
                icon: Users,
                title: "Unified Identity",
                desc: "Recognize your VIPs, Mods, and Subs across all platforms instantly."
              },
              {
                icon: MessageSquare,
                title: "Custom Overlays",
                desc: "Embed our chat widget directly into OBS with transparent backgrounds."
              },
              {
                icon: ArrowRight,
                title: "Scalable Architecture",
                desc: "Designed to handle 10k+ messages per second without stutter."
              }
            ].map((feature, i) => (
              <div key={i} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-indigo-500/30 hover:bg-white/[0.04]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="border-t border-white/5 bg-[#050505] py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">Need Help?</h2>
          <p className="mt-4 text-white/50">
            Our support team is available 24/7 to help you setup your stream.
          </p>
          
          <form className="mt-10 space-y-4 text-left">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60">Name</label>
                <input className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60">Email</label>
                <input className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Message</label>
              <textarea className="h-32 w-full resize-none rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none" placeholder="How can we help?" />
            </div>
            <button type="button" className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-gray-200">
              Send Message
            </button>
          </form>
        </div>
      </section>
      </div>
  );
}
