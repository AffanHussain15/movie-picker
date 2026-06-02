'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Sparkles, Award, Film, Play, ChevronRight, HelpCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-5xl px-6 pt-24 pb-16 text-center flex flex-col items-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-xs font-semibold text-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.1)]">
          <Sparkles className="h-4 w-4" />
          The Ultimate Movie Selection Tool
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-4xl">
          Find a Movie <br className="hidden sm:inline" />
          <span className="text-[#E50914] red-glow-text">Everyone</span> Will Love
        </h1>

        <p className="max-w-2xl text-base sm:text-xl text-zinc-400 font-medium leading-relaxed">
          Stop wasting 30 minutes deciding what to watch. Let Movie Night Picker aggregate your group's preferences, score matches, and find the perfect film.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center sm:w-auto">
          <Link
            href="/group/create"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold px-8 py-4 text-base transition-all shadow-[0_0_25px_rgba(229,9,20,0.4)] btn-red-glow"
          >
            Start Picking
            <ChevronRight className="h-5 w-5" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.15)] hover:border-white hover:bg-zinc-900/50 text-white font-bold px-8 py-4 text-base transition-all"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* Features preview panel */}
      <section className="w-full max-w-6xl px-6 py-16 z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-12 flex items-center justify-center gap-2">
          ⚡ Packed with Premium Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 hover:border-[#E50914]/30 hover:shadow-[0_10px_30px_rgba(229,9,20,0.08)] transition-all">
            <div className="rounded-lg bg-zinc-800/80 border border-zinc-700/50 p-3 text-[#E50914] w-fit mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Group Voting</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every member selects genres, moods, and runtimes. Votes are aggregated instantly to rank options.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 hover:border-[#E50914]/30 hover:shadow-[0_10px_30px_rgba(229,9,20,0.08)] transition-all">
            <div className="rounded-lg bg-zinc-800/80 border border-zinc-700/50 p-3 text-[#E50914] w-fit mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Recommendation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculates match scores and provides custom explanations showing exactly why a movie fits.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 hover:border-[#E50914]/30 hover:shadow-[0_10px_30px_rgba(229,9,20,0.08)] transition-all">
            <div className="rounded-lg bg-zinc-800/80 border border-zinc-700/50 p-3 text-[#E50914] w-fit mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Compatibility Scores</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Discovers how similar your group members' tastes are with pairwise overlap metrics.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel rounded-2xl p-6 hover:border-[#E50914]/30 hover:shadow-[0_10px_30px_rgba(229,9,20,0.08)] transition-all">
            <div className="rounded-lg bg-zinc-800/80 border border-zinc-700/50 p-3 text-[#E50914] w-fit mb-4">
              <Film className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trailer Preview</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Watch official YouTube trailers directly in-app, inside our custom theater modal interface.
            </p>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="w-full max-w-4xl px-6 py-20 border-t border-[rgba(255,255,255,0.05)] z-10">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12 flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-[#E50914]" />
          How It Works
        </h2>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700 text-xl font-bold text-[#E50914]">
              1
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Create a Group</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your group name (e.g. "Friday Couch Night") and list the members. Start in **Couch Mode** (passing the device around) or share a link for **Remote Mode** (members join on their own phones).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700 text-xl font-bold text-[#E50914]">
              2
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Enter Movie Preferences</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Each member selects genres they are in the mood for, length of movie, languages, and a release year range slider (1980 - 2026).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700 text-xl font-bold text-[#E50914]">
              3
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Review Recommendations & Swipe</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                The engine matches filters, calculates compatibility matrices, and ranks films. Then, enter the **Swipe Deck** to vote "Watch" or "Skip" Tinder-style. Once all members swipe right on a movie, a 🎉 **Perfect Match!** is found.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700 text-xl font-bold text-[#E50914]">
              4
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Still Can't Decided? Spin the Wheel!</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                If the group remains split, load the top 8 recommendations onto the **animated movie wheel** and let fate choose your film. Sound clicking ticks included!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/group/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold px-8 py-4 text-base transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] btn-red-glow"
          >
            Start Your Session Now
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
