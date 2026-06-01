'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Database, RefreshCw, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [tmdbKey, setTmdbKey] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTmdbKey(localStorage.getItem('tmdb_api_key') || '');
      setMongoUri(localStorage.getItem('mongodb_uri') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tmdb_api_key', tmdbKey.trim());
      localStorage.setItem('mongodb_uri', mongoUri.trim());
    }
    
    // Simulate API saving / page reloading
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        window.location.reload(); // Reload to apply new environment keys via headers
      }, 1000);
    }, 800);
  };

  const handleClear = () => {
    setTmdbKey('');
    setMongoUri('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tmdb_api_key');
      localStorage.removeItem('mongodb_uri');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl glass-panel text-white animate-in fade-in zoom-in-95 duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] px-6 py-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            ⚙️ Developer Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-zinc-400">
            By default, Movie Night Picker uses a **curated local database of 30 blockbuster movies** and a local JSON database fallback. You can plug in your own keys below to enable dynamic live movies and MongoDB integration.
          </p>

          {/* TMDB key */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-zinc-300">
              <Key className="h-4 w-4 text-[#E50914]" />
              TMDB API Key (v3)
            </label>
            <input
              type="password"
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              placeholder="Paste TMDB API Key..."
              className="w-full rounded-lg bg-zinc-900 border border-[rgba(255,255,255,0.08)] px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
            <p className="text-[11px] text-zinc-500">
              Used to pull real-time popular films and trailer metadata. Get one at <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-[#E50914] underline hover:text-red-400">themoviedb.org</a>.
            </p>
          </div>

          {/* Mongo URI */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-zinc-300">
              <Database className="h-4 w-4 text-[#E50914]" />
              MongoDB Connection URI
            </label>
            <input
              type="text"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://..."
              className="w-full rounded-lg bg-zinc-900 border border-[rgba(255,255,255,0.08)] px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
            <p className="text-[11px] text-zinc-500">
              Connect to a cloud MongoDB instance. Falls back to a local JSON file in workspace if blank.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] px-6 py-4 bg-zinc-950/40">
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Clear Keys
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#E50914] hover:bg-[#B20710] text-white px-5 py-2 text-sm font-semibold transition-all shadow-[0_0_10px_rgba(229,9,20,0.3)] disabled:opacity-50 btn-red-glow"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : null}
              {saved ? 'Saved!' : 'Save & Reload'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
