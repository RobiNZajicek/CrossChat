'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, Clock } from 'lucide-react';

type ToastProps = {
  message: string;
  duration?: string;
  onClose: () => void;
};

export function Toast({ message, duration, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl p-4 shadow-2xl min-w-[320px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
          <CheckCircle className="text-emerald-400" size={20} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white mb-1">Stream Ended</div>
          <div className="text-sm text-white/70">{message}</div>
          {duration && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <Clock size={12} />
              <span>You were live for {duration}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/40 hover:text-white transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

