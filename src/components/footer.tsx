import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">CrossChat</h3>
            <p className="text-sm leading-relaxed text-white/50">
              The ultimate high-concurrency stream aggregator. 
              Unified chat feeds for professional broadcasters.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/40 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/40 hover:text-white">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Integrations</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API Reference</a></li>
              <li><a href="#" className="hover:text-white">Community</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-white/30">
          © {new Date().getFullYear()} CrossChat Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

