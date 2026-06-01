'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden py-16 px-6">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-3xl space-y-12 z-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            About <span className="text-[#E50914]">Movie Night Picker</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Resolving the age-old dilemma: five people, one couch, and absolutely no agreement.
          </p>
        </div>

        {/* Math explanation */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white border-b border-[rgba(255,255,255,0.06)] pb-3">
            🧠 How the Matching Math Works
          </h2>

          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
            <p>
              When everyone in the group submits their preferences, our recommendation engine aggregates these filters to build a **collective taste profile**.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
                <span className="font-bold text-[#E50914]">1. Genres (40% Weight):</span>
                <p className="text-xs text-zinc-400 mt-1">
                  We look at all genres chosen across all members. If a candidate movie overlaps with a member's selected genres, that member is considered a genre match.
                </p>
              </div>

              <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
                <span className="font-bold text-[#E50914]">2. Mood (20% Weight):</span>
                <p className="text-xs text-zinc-400 mt-1">
                  We find the most voted mood in the group. If the movie's mood matches the group's top mood, it gets maximum points. It also awards fractional points for matching runner-up selected moods.
                </p>
              </div>

              <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
                <span className="font-bold text-[#E50914]">3. Runtime & Language (15% Weight Each):</span>
                <p className="text-xs text-zinc-400 mt-1">
                  For each member, we verify if the movie's length and language comply with their criteria (e.g. Under 90 mins, English, Japanese). The score scales linearly based on the fraction of matching members.
                </p>
              </div>

              <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-[rgba(255,255,255,0.04)]">
                <span className="font-bold text-[#E50914]">4. Release Year Range (10% Weight):</span>
                <p className="text-xs text-zinc-400 mt-1">
                  Checks if the movie release year fits between the minimum and maximum boundaries chosen by each member.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compatibility formula */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white border-b border-[rgba(255,255,255,0.06)] pb-3">
            📊 Pairwise Member Compatibility
          </h2>
          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
            <p>
              To discover how similar group members are, we calculate a **Compatibility Score** between every pair of members:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400 leading-normal">
              <li>**Genre Overlap:** Computed using the **Jaccard Similarity Coefficient** (size of intersection divided by size of union).</li>
              <li>**Mood & Length:** Compares categories exactly, with fallback values if one member selects "Any".</li>
              <li>**Release Year Alignment:** Overlap length of their slider ranges divided by the union range.</li>
            </ul>
            <p>
              This is averaged and displayed as a percentage so you can see who is most (or least) aligned in the group!
            </p>
          </div>
        </section>

        {/* Developer CTA */}
        <div className="text-center pt-4">
          <Link
            href="/group/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold px-8 py-3 text-sm transition-all btn-red-glow"
          >
            Start a Group Session
          </Link>
        </div>

      </div>
    </div>
  );
}
