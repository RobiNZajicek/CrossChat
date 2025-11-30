import Link from "next/link";
import { MessageSquareShare } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 transition-transform group-hover:scale-110">
            <MessageSquareShare className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            CrossChat
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden gap-6 text-sm font-medium text-white/60 md:flex">
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
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Launch Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

