'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import SettingsModal from './SettingsModal';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F] text-white">
      {/* Dynamic Navbar */}
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* Settings Dialog Overlay */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] bg-zinc-950/60 py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Movie Night Picker. No more arguments on the couch.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setSettingsOpen(true)} 
              className="hover:text-white transition-colors"
            >
              Developer Settings
            </button>
            <a href="/about" className="hover:text-white transition-colors">How it Works</a>
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TMDB API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
