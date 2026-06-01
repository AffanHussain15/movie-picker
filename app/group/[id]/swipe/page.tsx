'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Sparkles, Film, ArrowLeft, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Group, Member } from '../../../../lib/db/models';
import { Movie } from '../../../../lib/mockMovies';

export default function SwipeDeck({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: groupId } = use(params);

  // States
  const [group, setGroup] = useState<Group | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Voting identification
  const [memberId, setMemberId] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  // Deck state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [perfectMatch, setPerfectMatch] = useState<Movie | null>(null);

  // Drag animation hooks
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (group) {
      // Find default active member from localStorage
      let savedId = localStorage.getItem(`group_member_${groupId}`);
      if (!savedId && group.members.length > 0) {
        // Fallback or show select
        setShowMemberSelect(true);
      } else {
        const found = group.members.find(m => m.id === savedId);
        if (found) {
          setMemberId(found.id);
          setActiveMember(found);
          setShowMemberSelect(false);
        } else {
          setShowMemberSelect(true);
        }
      }
    }
  }, [group]);

  const fetchGroup = async () => {
    try {
      const devTmdbKey = localStorage.getItem('tmdb_api_key') || '';
      const headers: Record<string, string> = {};
      if (devTmdbKey) {
        headers['x-tmdb-key'] = devTmdbKey;
      }

      const res = await fetch(`/api/groups/${groupId}`, { headers });
      const data = await res.json();
      
      if (data.success) {
        setGroup(data.group);
        // Load the top 15 recommendations to swipe on
        setMovies(data.recommendations?.slice(0, 15) || []);
        setError('');
      } else {
        setError(data.error || 'Failed to load session details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (m: Member) => {
    setMemberId(m.id);
    setActiveMember(m);
    localStorage.setItem(`group_member_${groupId}`, m.id);
    setShowMemberSelect(false);
    
    // Recalculate index based on member's existing swipes
    if (movies.length > 0) {
      const firstUnvotedIndex = movies.findIndex(movie => !m.swipes || !m.swipes[movie.id]);
      setCurrentIndex(firstUnvotedIndex !== -1 ? firstUnvotedIndex : movies.length);
    }
  };

  const handleSwipe = async (dir: 'like' | 'skip') => {
    if (!memberId || currentIndex >= movies.length || !group) return;

    const movie = movies[currentIndex];
    
    // Optimistic index update
    setCurrentIndex(prev => prev + 1);

    try {
      const res = await fetch(`/api/groups/${groupId}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          movieId: movie.id,
          vote: dir,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setGroup(data.group);
        
        // Trigger confetti & perfect match overlay
        if (data.isPerfectMatch) {
          setPerfectMatch(movie);
          triggerConfetti();
        }
      }
    } catch (err) {
      console.error('Failed to submit swipe', err);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E50914', '#FFFFFF', '#1A1A1A'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E50914', '#FFFFFF', '#1A1A1A'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('like');
    } else if (info.offset.x < -threshold) {
      handleSwipe('skip');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-t-[#E50914] border-zinc-800 animate-spin" />
        <p className="text-zinc-500 text-sm">Aligning swipe deck...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 space-y-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-500 max-w-sm">
          ⚠️ {error || 'Session not found.'}
        </div>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 text-sm transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  const activeMovie = movies[currentIndex];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden py-12 px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      {/* Choose Voter Modal if needed */}
      {showMemberSelect && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel p-6 text-center space-y-6 rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Who is Swiping?</h2>
              <p className="text-xs text-zinc-500">Select your name to start voting</p>
            </div>
            <div className="space-y-2">
              {group.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMember(m)}
                  className="w-full flex justify-between items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-bold py-3 px-4 rounded-xl text-sm transition-colors"
                >
                  <span>{m.name}</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {m.preferences ? 'Preferences Set' : 'Pending Preferences'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main deck view */}
      <div className="w-full max-w-sm space-y-6 z-10 flex flex-col items-center">
        
        {/* Navigation back and switcher */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => router.push(`/group/${groupId}`)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          {activeMember && (
            <button
              onClick={() => setShowMemberSelect(true)}
              className="text-xs font-bold text-[#E50914] bg-[#E50914]/10 border border-red-500/20 rounded-full px-4 py-1.5 hover:bg-[#E50914] hover:text-white transition-all shadow-md"
            >
              Voter: {activeMember.name} 🔄
            </button>
          )}
        </div>

        {/* Swipe Box Deck Container */}
        <div className="relative w-full h-[480px] flex items-center justify-center">
          <AnimatePresence>
            {activeMovie ? (
              <motion.div
                key={activeMovie.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                style={{ x, rotate, opacity }}
                onDragEnd={handleDragEnd}
                className="absolute w-full h-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-zinc-900 overflow-hidden shadow-2xl flex flex-col justify-end cursor-grab active:cursor-grabbing select-none"
              >
                {/* Poster backdrop */}
                <img
                  src={activeMovie.poster}
                  alt={activeMovie.title}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                
                {/* Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 pointer-events-none" />

                {/* Details layout overlay */}
                <div className="p-6 relative space-y-3 text-white pointer-events-none">
                  <span className="bg-[#E50914] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {(activeMovie as any).matchScore ? `${(activeMovie as any).matchScore}% Match` : 'Recommend'}
                  </span>

                  <div>
                    <h3 className="text-2xl font-extrabold line-clamp-1">{activeMovie.title}</h3>
                    <p className="text-xs text-zinc-400 font-medium">{activeMovie.year} • {activeMovie.runtime} min • {activeMovie.language}</p>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                    {activeMovie.overview}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-4 rounded-2xl border border-dashed border-zinc-800 bg-[#1A1A1A]/10 w-full h-full p-8">
                <div className="rounded-full bg-zinc-900 border border-zinc-800 p-4 text-zinc-500">
                  <Film className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Deck Cleared!</h3>
                  <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                    You have voted on all recommendations. Let other members finish swiping or view the dashboard matches!
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/group/${groupId}/results`)}
                  className="rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-2.5 px-6 text-xs transition-colors"
                >
                  View Final Results
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons layout */}
        {activeMovie && (
          <div className="flex items-center gap-6 mt-4">
            {/* Skip Button */}
            <button
              onClick={() => handleSwipe('skip')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors shadow-lg"
              title="Skip Movie"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Like Button */}
            <button
              onClick={() => handleSwipe('like')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E50914] text-white hover:bg-[#B20710] hover:scale-105 transition-all shadow-lg shadow-red-950/40 btn-red-glow"
              title="Watch This Movie"
            >
              <Heart className="h-6 w-6 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* Perfect Match Overlay Modal */}
      <AnimatePresence>
        {perfectMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel p-6 sm:p-8 text-center space-y-6 rounded-2xl border border-red-500/30"
            >
              <div className="space-y-1 flex flex-col items-center">
                <div className="rounded-full bg-red-500/10 border border-red-500/20 p-3 text-[#E50914] w-fit animate-pulse mb-2">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider red-glow-text">
                  Perfect Match Found!
                </h2>
                <p className="text-xs text-zinc-400 max-w-xs">
                  🎉 All active voters swiped **Watch** on this movie! Grab the popcorn!
                </p>
              </div>

              {/* Movie Details in Match */}
              <div className="flex gap-4 items-start bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-left">
                <img
                  src={perfectMatch.poster}
                  alt={perfectMatch.title}
                  className="w-20 h-28 object-cover rounded-lg border border-zinc-800 shrink-0"
                />
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-lg text-white leading-tight">{perfectMatch.title}</h3>
                  <p className="text-xs text-[#E50914] font-bold">{perfectMatch.year} • {perfectMatch.runtime} min</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">{perfectMatch.overview}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/group/${groupId}/results?winner=${perfectMatch.id}`)}
                  className="flex-1 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-3 px-4 text-xs transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)]"
                >
                  View Details & Trailer
                </button>
                <button
                  onClick={() => setPerfectMatch(null)}
                  className="flex-1 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold py-3 px-4 text-xs transition-colors"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
