import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 transition-transform group-hover:scale-105">
            <MessageSquare className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            CrossChat
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden gap-8 text-sm font-medium text-white/50 md:flex">
            <Link href="/#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="/#pricing" className="transition hover:text-white">
              Pricing
            </Link>
            <Link href="/#support" className="transition hover:text-white">
              Support
            </Link>
          </div>
          <div className="h-5 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
