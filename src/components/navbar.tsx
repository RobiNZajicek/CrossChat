import Link from "next/link";
import { MessageSquareShare } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-105">
            <MessageSquareShare className="text-white" size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Cross<span className="text-orange-400">Chat</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden gap-6 text-sm font-medium text-white/60 md:flex">
            <Link href="/#features" className="transition hover:text-orange-400">
              Features
            </Link>
            <Link href="/#pricing" className="transition hover:text-orange-400">
              Pricing
            </Link>
            <Link href="/#support" className="transition hover:text-orange-400">
              Support
            </Link>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <Link
            href="/login"
            className="text-sm font-medium text-white/60 hover:text-white transition hidden md:block"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
