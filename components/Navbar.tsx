'use strict';

import React from 'react';
import Link from 'next/link';
import { Film, Compass, List, Heart, Settings } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
}

export default function Navbar({ onOpenSettings }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#0F0F0F]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-[#E50914] p-1.5 text-white shadow-[0_0_10px_rgba(229,9,20,0.5)]">
              <Film className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white sm:block">
              MOVIE<span className="text-[#E50914]">PICKER</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/watchlist"
            className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Watchlist</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </Link>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center rounded-full p-2 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 animate-[spin_20s_linear_infinite]" />
          </button>
        </nav>
      </div>
    </header>
  );
}
