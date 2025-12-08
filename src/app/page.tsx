import Link from "next/link";
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  MessageSquare, 
  Users,
  Twitch,
  Youtube,
  Facebook,
  Music2,
  Tv,
  Radio,
  Check,
  Star
} from "lucide-react";

// Platform icons for hero section
const PLATFORMS = [
  { name: "Twitch", icon: Twitch, color: "text-purple-400" },
  { name: "YouTube", icon: Youtube, color: "text-red-400" },
  { name: "Kick", icon: MessageSquare, color: "text-emerald-400" },
  { name: "Facebook", icon: Facebook, color: "text-blue-400" },
  { name: "TikTok", icon: Music2, color: "text-pink-400" },
  { name: "Bilibili", icon: Tv, color: "text-cyan-400" },
  { name: "Trovo", icon: Radio, color: "text-teal-400" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 bg-[#050505] pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-300 backdrop-blur mb-8">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            Now supporting 9 streaming platforms
          </div>
          
          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            All Your Chats.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              One Stream.
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/50">
            Stop switching between Twitch, YouTube, Kick, and more. 
            CrossChat unifies all your platform chats into a single, 
            beautiful feed with zero latency.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
            >
              Start For Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See Features
            </Link>
          </div>

          {/* Platform Icons */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {PLATFORMS.map((platform) => (
              <div 
                key={platform.name}
                className="flex items-center gap-2 rounded-full bg-white/5 border border-white/5 px-4 py-2"
              >
                <platform.icon size={16} className={platform.color} />
                <span className="text-sm text-white/60">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-white/5 bg-[#0a0a0a] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Active Streamers" },
              { value: "9", label: "Platforms Supported" },
              { value: "99.9%", label: "Uptime" },
              { value: "<10ms", label: "Latency" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-400">{stat.value}</div>
                <div className="mt-1 text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="mt-4 text-4xl font-bold text-white">Why Streamers Choose CrossChat</h2>
            <p className="mt-4 text-white/50 max-w-2xl mx-auto">
              Built with performance in mind. Handle thousands of messages per second 
              without breaking a sweat.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Zero Latency",
                desc: "Powered by Node.js Worker Threads for non-blocking message processing. Your chat stays real-time.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10"
              },
              {
                icon: Globe,
                title: "9 Platforms",
                desc: "Twitch, YouTube, Kick, Facebook, TikTok, Discord, Bilibili, X, and Trovo - all in one place.",
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              },
              {
                icon: ShieldCheck,
                title: "AI Moderation",
                desc: "Coming soon: AI-powered chat moderation that understands context, not just keywords.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Users,
                title: "Unified Identity",
                desc: "Recognize VIPs, Mods, and Subs across all platforms with unified badges.",
                color: "text-purple-400",
                bg: "bg-purple-500/10"
              },
              {
                icon: MessageSquare,
                title: "OBS Integration",
                desc: "Embed our chat widget directly into OBS with customizable transparent overlays.",
                color: "text-pink-400",
                bg: "bg-pink-500/10"
              },
              {
                icon: ArrowRight,
                title: "Donations",
                desc: "Coming soon: Accept donations directly through CrossChat with lower fees than platform defaults.",
                color: "text-orange-400",
                bg: "bg-orange-500/10"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:border-orange-500/20 hover:bg-white/[0.04]"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform group-hover:scale-110`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">How It Works</span>
            <h2 className="mt-4 text-4xl font-bold text-white">Get Started in 3 Steps</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create Account", desc: "Sign up for free in under 30 seconds" },
              { step: "02", title: "Connect Platforms", desc: "Link your Twitch, YouTube, and other accounts" },
              { step: "03", title: "Go Live", desc: "Start streaming with unified chat instantly" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-orange-500/20">{item.step}</div>
                <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Pricing</span>
            <h2 className="mt-4 text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-lg font-semibold text-white">Starter</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-white/40">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["3 Platforms", "1,000 msgs/stream", "Basic overlay", "Community support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={16} className="text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 block w-full rounded-lg border border-white/10 py-3 text-center text-sm font-semibold text-white hover:bg-white/5 transition">
                Get Started
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="relative rounded-2xl border-2 border-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold text-white">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-white/40">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["All 9 Platforms", "Unlimited messages", "Custom overlays", "AI Moderation", "Priority support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={16} className="text-orange-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 block w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 py-3 text-center text-sm font-semibold text-white hover:shadow-lg hover:shadow-orange-500/25 transition">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-lg font-semibold text-white">Enterprise</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="mt-6 space-y-3">
                {["Everything in Pro", "Dedicated server", "Custom integrations", "SLA guarantee", "24/7 phone support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={16} className="text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="#support" className="mt-8 block w-full rounded-lg border border-white/10 py-3 text-center text-sm font-semibold text-white hover:bg-white/5 transition">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-4 text-4xl font-bold text-white">Loved by Streamers</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "xQcOW", platform: "Twitch", text: "Finally don't have to check 5 different tabs. Game changer." },
              { name: "MrBeast", platform: "YouTube", text: "The unified chat makes managing multi-platform streams so much easier." },
              { name: "Ninja", platform: "Kick", text: "Love the AI moderation feature. Saves me from hiring extra mods." },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-white/70 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600" />
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.platform} Partner</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-24 bg-[#050505]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-wider">Support</span>
          <h2 className="mt-4 text-4xl font-bold text-white">Need Help?</h2>
          <p className="mt-4 text-white/50">
            Our support team is available 24/7 to help you get the most out of CrossChat.
          </p>
          
          <form className="mt-10 space-y-4 text-left">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60">Name</label>
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-orange-500/50 focus:outline-none transition" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60">Email</label>
                <input className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-orange-500/50 focus:outline-none transition" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60">Message</label>
              <textarea className="h-32 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-orange-500/50 focus:outline-none transition" placeholder="How can we help?" />
            </div>
            <button type="button" className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-4 font-semibold text-white transition hover:shadow-lg hover:shadow-orange-500/25">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to unify your chat?
          </h2>
          <p className="mt-4 text-lg text-white/50">
            Join thousands of streamers who already use CrossChat.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
