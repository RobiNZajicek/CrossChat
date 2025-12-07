import Link from "next/link";
import { MessageSquare, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <MessageSquare className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold text-white">CrossChat</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              Unify your stream chat across Twitch, YouTube, and Kick in one beautiful dashboard.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition">
                <Twitter size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Product</div>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-white/50 hover:text-white transition">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm text-white/50 hover:text-white transition">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition">Dashboard</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">API</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Company</div>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">About</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">Careers</Link></li>
              <li><Link href="/#support" className="text-sm text-white/50 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Legal</div>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">Privacy</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">Terms</Link></li>
              <li><Link href="#" className="text-sm text-white/50 hover:text-white transition">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} CrossChat. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span>Made with <span className="text-orange-400">♥</span> for streamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
