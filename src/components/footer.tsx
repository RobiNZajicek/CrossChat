import Link from "next/link";
import { MessageSquareShare, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <MessageSquareShare className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold text-white">
                Cross<span className="text-orange-400">Chat</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              Unified streaming chat for professional broadcasters. One feed, all platforms.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link href="/#features" className="hover:text-orange-400 transition">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-orange-400 transition">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-400 transition">Dashboard</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition">API Docs</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-400 transition">About</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Careers</a></li>
              <li><Link href="/#support" className="hover:text-orange-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><a href="#" className="hover:text-orange-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} CrossChat. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Made with 🧡 for streamers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
