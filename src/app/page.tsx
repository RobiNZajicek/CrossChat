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
  Play,
  BarChart3,
  Check,
  Star,
  Sparkles,
  Facebook,
  Music2,
  Gamepad2,
  Twitter,
  Tv,
  Radio
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-400 backdrop-blur mb-8">
            <Sparkles size={12} />
            v2.0 Now Available — Multi-Platform Support
          </div>
          
          {/* Main Title */}
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Unify Your Stream
            <span className="block mt-2 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Into One Chat
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50">
            Stop switching between Twitch, YouTube, and Kick. 
            CrossChat aggregates all your chat messages in real-time with zero latency.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-semibold text-white transition hover:opacity-90 shadow-lg shadow-orange-500/25"
            >
              Start Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
          
          {/* Platform Icons */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Twitch, name: 'Twitch', color: 'text-purple-400' },
              { icon: Youtube, name: 'YouTube', color: 'text-red-400' },
              { icon: MessageSquare, name: 'Kick', color: 'text-emerald-400' },
              { icon: Facebook, name: 'Facebook', color: 'text-blue-400' },
              { icon: Music2, name: 'TikTok', color: 'text-pink-400' },
              { icon: Gamepad2, name: 'Discord', color: 'text-indigo-400' },
              { icon: Tv, name: 'Bilibili', color: 'text-cyan-400' },
              { icon: Twitter, name: 'X', color: 'text-gray-400' },
              { icon: Radio, name: 'Trovo', color: 'text-teal-400' },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center gap-2 text-white/30">
                <platform.icon size={18} className={platform.color} />
                <span className="text-xs">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-[#121212] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: "50K+", label: "Active Streamers" },
              { value: "10M+", label: "Messages Processed" },
              { value: "99.9%", label: "Uptime" },
              { value: "<1ms", label: "Latency" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4">
              Features
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Why Streamers Choose CrossChat</h2>
            <p className="text-white/50 max-w-xl mx-auto">Built for high-velocity streaming environments with enterprise-grade reliability.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Zero Latency",
                desc: "Powered by Worker Threads for non-blocking message processing. Your chat updates instantly.",
                color: "orange"
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                desc: "Seamlessly integrates with Twitch, YouTube Live, and Kick. One dashboard for everything.",
                color: "emerald"
              },
              {
                icon: ShieldCheck,
                title: "Thread Safe",
                desc: "Mutex-guarded shared memory prevents race conditions. No message gets lost.",
                color: "blue"
              },
              {
                icon: Users,
                title: "Unified Badges",
                desc: "Recognize VIPs, Mods, and Subs across all platforms with unified badge system.",
                color: "purple"
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Track your stream performance with detailed analytics and activity heatmaps.",
                color: "pink"
              },
              {
                icon: Play,
                title: "Stream History",
                desc: "Archive and review past streams. Never lose a memorable chat moment.",
                color: "amber"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group rounded-2xl border border-white/5 bg-[#1a1a1a] p-8 transition hover:border-orange-500/30 hover:bg-[#1f1f1f]"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10`}>
                  <feature.icon size={24} className="text-orange-400" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#121212]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4">
              How It Works
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Get Started in Minutes</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create Account", desc: "Sign up for free and setup your streamer profile." },
              { step: "02", title: "Connect Platforms", desc: "Link your Twitch, YouTube, and Kick accounts." },
              { step: "03", title: "Go Live", desc: "Start streaming and watch all chats merge into one." },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-orange-500/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4">
              Pricing
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/50">Start free, upgrade when you need more.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for getting started",
                features: ["3 platforms", "1,000 messages/day", "7-day history", "Basic analytics"],
                cta: "Get Started",
                highlighted: false
              },
              {
                name: "Pro",
                price: "$9",
                desc: "For serious streamers",
                features: ["Unlimited platforms", "Unlimited messages", "Forever history", "Advanced analytics", "Priority support", "Custom badges"],
                cta: "Upgrade to Pro",
                highlighted: true
              },
              {
                name: "Team",
                price: "$29",
                desc: "For streaming teams",
                features: ["Everything in Pro", "5 team members", "Shared analytics", "API access", "White-label option"],
                cta: "Contact Sales",
                highlighted: false
              }
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`rounded-2xl p-8 ${
                  plan.highlighted 
                    ? 'border-2 border-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent relative' 
                    : 'border border-white/10 bg-[#1a1a1a]'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-sm text-white/50 mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40">/month</span>
                </div>
                <p className="text-sm text-white/40 mb-6">{plan.desc}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={16} className="text-orange-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/register"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                    plan.highlighted
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#121212]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4">
              Testimonials
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Streamers</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { 
                name: "Alex_Streams", 
                platform: "Twitch Partner",
                text: "CrossChat completely changed how I manage my multi-platform streams. The unified chat is a game changer!",
                avatar: "A"
              },
              { 
                name: "GamerGirl99", 
                platform: "YouTube Creator",
                text: "Finally I don't have to switch between tabs during streams. The latency is incredible - feels instant.",
                avatar: "G"
              },
              { 
                name: "ProPlayer_Mike", 
                platform: "Kick Streamer",
                text: "The analytics dashboard is beautiful. I can see exactly when my audience is most active. Love it!",
                avatar: "P"
              },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-[#1a1a1a] p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{testimonial.name}</div>
                    <div className="text-xs text-white/40">{testimonial.platform}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4">
                Support
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Need Help?</h2>
              <p className="text-white/50">Our support team is available 24/7.</p>
            </div>
            
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Name</label>
                  <input 
                    className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                    placeholder="Your name" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60">Email</label>
                  <input 
                    className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                    placeholder="you@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60">Message</label>
                <textarea 
                  className="h-32 w-full resize-none rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none transition" 
                  placeholder="How can we help?" 
                />
              </div>
              <button 
                type="button" 
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 font-semibold text-white transition hover:opacity-90"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#121212]">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Unify Your Stream?
          </h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            Join thousands of streamers who already use CrossChat to manage their multi-platform communities.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-10 py-4 text-sm font-semibold text-white transition hover:opacity-90 shadow-lg shadow-orange-500/25"
          >
            Get Started for Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
