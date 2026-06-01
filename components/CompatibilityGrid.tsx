'use client';

import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { CompatibilityResult } from '../lib/recommend';

interface CompatibilityGridProps {
  compatibility: CompatibilityResult[];
}

export default function CompatibilityGrid({ compatibility }: CompatibilityGridProps) {
  if (compatibility.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-[rgba(255,255,255,0.08)] bg-zinc-900/30 text-center text-zinc-500">
        <Users className="h-10 w-10 text-zinc-600 mb-2" />
        <p className="text-sm">Not enough data to calculate compatibility.</p>
        <p className="text-xs text-zinc-600 mt-1">Requires preferences from at least 2 members.</p>
      </div>
    );
  }

  // Helper to color-code compatibility percentage
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'text-[#E50914] bg-red-500/10 border-red-500/20';
    return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {compatibility.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-zinc-900/40 backdrop-blur-sm"
          >
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" />
                {item.member1} & {item.member2}
              </span>
              <span className="text-xs text-zinc-500">Preference Overlap Similarity</span>
            </div>

            <div className={`flex items-center justify-center font-bold px-3 py-1.5 rounded-lg border text-lg ${getScoreColorClass(item.score)}`}>
              {item.score}%
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-start p-3.5 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#1A1A1A]/40 text-xs text-zinc-400 leading-normal">
        <AlertTriangle className="h-4.5 w-4.5 text-zinc-500 shrink-0 mt-0.5" />
        <span>
          Scores are derived by comparing genres, moods, runtimes, languages, and release year ranges. Over 80% represents extreme movie night alignment!
        </span>
      </div>
    </div>
  );
}
