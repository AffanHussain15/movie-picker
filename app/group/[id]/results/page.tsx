'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, RefreshCw, Compass, Heart, Award, HelpCircle, X, ChevronRight } from 'lucide-react';
import { Group, Member } from '../../../../lib/db/models';
import { Movie } from '../../../../lib/mockMovies';
import MovieCard from '../../../../components/MovieCard';
import SpinningWheel from '../../../../components/SpinningWheel';
import CompatibilityGrid from '../../../../components/CompatibilityGrid';

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: groupId } = use(params);

  // States
  const [group, setGroup] = useState<Group | null>(null);
  const [recommendations, setRecommendations] = useState<(Movie & { matchScore?: number; aiExplanation?: string })[]>([]);
  const [compatibility, setCompatibility] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Watchlist states
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [localWatchlist, setLocalWatchlist] = useState<Movie[]>([]);

  // Modals / Overlays
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  const [winnerMovie, setWinnerMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetchResults();
    loadLocalWatchlist();
  }, [groupId]);

  const fetchResults = async () => {
    setLoading(true);
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
        setRecommendations(data.recommendations || []);
        setCompatibility(data.compatibility || []);
        setWatchlistIds(data.group.watchlist || []);
        setError('');
      } else {
        setError(data.error || 'Failed to calculate results.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const loadLocalWatchlist = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('movie_picker_watchlist');
      if (saved) {
        try {
          setLocalWatchlist(JSON.parse(saved));
        } catch {}
      }
    }
  };

  // Handle local storage watchlist save/remove toggle
  const handleToggleWatchlist = (movie: Movie) => {
    let updated: Movie[] = [];
    const isSaved = localWatchlist.some((m) => m.id === movie.id);
    
    if (isSaved) {
      updated = localWatchlist.filter((m) => m.id !== movie.id);
    } else {
      updated = [...localWatchlist, movie];
    }
    
    setLocalWatchlist(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('movie_picker_watchlist', JSON.stringify(updated));
    }

    // Also sync with backend shared watchlist for this group
    toggleBackendWatchlist(movie.id, isSaved);
  };

  const toggleBackendWatchlist = async (movieId: string, isCurrentlySaved: boolean) => {
    try {
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      const url = isCurrentlySaved 
        ? `/api/groups/${groupId}/watchlist?movieId=${movieId}` 
        : `/api/groups/${groupId}/watchlist`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isCurrentlySaved ? undefined : JSON.stringify({ movieId }),
      });
      const data = await res.json();
      if (data.success) {
        setWatchlistIds(data.watchlist || []);
      }
    } catch (err) {
      console.error('Watchlist sync error', err);
    }
  };

  const handlePlayTrailer = (trailerId: string) => {
    setActiveTrailerUrl(`https://www.youtube.com/embed/${trailerId}?autoplay=1`);
  };

  const handleResetSession = async () => {
    if (confirm('Are you sure you want to clear preferences and vote again for this group?')) {
      try {
        setLoading(true);
        // We will call a reset routine, or simply update preferences for all members to null
        for (const m of group?.members || []) {
          await fetch(`/api/groups/${groupId}/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId: m.id,
              preferences: null,
            }),
          });
        }
        router.push(`/group/${groupId}`);
      } catch (err) {
        console.error(err);
        alert('Failed to reset group voting.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-t-[#E50914] border-zinc-800 animate-spin" />
        <p className="text-zinc-500 text-sm">Running recommendation math...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 space-y-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-500 max-w-sm">
          ⚠️ {error || 'Failed to compute matches.'}
        </div>
        <button
          onClick={() => router.push(`/group/${groupId}`)}
          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 text-sm transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden py-12 px-4 sm:px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-5xl space-y-12 z-10">
        
        {/* Navigation & Controls header */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 p-2.5 text-[#E50914]">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Recommendations Results</h1>
              <p className="text-xs text-zinc-400">Perfect movie suggestions ranked by compatibility percentage</p>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => router.push(`/group/${groupId}`)}
              className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-zinc-900/60 hover:bg-zinc-800 text-white font-bold py-2.5 px-5 text-xs transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleResetSession}
              className="flex items-center gap-1.5 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-2.5 px-5 text-xs transition-colors btn-red-glow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Vote Again
            </button>
          </div>
        </div>

        {/* Results grid & Layout panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Movie Suggestions (List 2 columns width on lg screens) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🍿 Shortlisted Recommendations
            </h2>

            <div className="space-y-6">
              {recommendations.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">No recommendations match your exact criteria. Try resetting and widening filters!</p>
              ) : (
                recommendations.slice(0, 10).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSaved={localWatchlist.some((m) => m.id === movie.id)}
                    onToggleWatchlist={() => handleToggleWatchlist(movie)}
                    onPlayTrailer={handlePlayTrailer}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right sidebar: Spin wheel & compatibility */}
          <div className="space-y-8">
            
            {/* Spinning Wheel */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border border-[rgba(255,255,255,0.08)]">
              <h2 className="text-lg font-bold text-white text-center flex items-center justify-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                🎡 Can't Decide? Spin Fate!
              </h2>
              <p className="text-center text-xs text-zinc-400">
                Puts your top recommendations on the wheel and chooses one at random. Decelerating audio ticks included!
              </p>
              
              <SpinningWheel
                movies={recommendations}
                onWinner={(m) => setWinnerMovie(m)}
              />
            </div>

            {/* Compatibility Scoring */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border border-[rgba(255,255,255,0.08)]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                <Award className="h-5 w-5 text-[#E50914]" />
                Compatibility Score
              </h2>
              <CompatibilityGrid compatibility={compatibility} />
            </div>

          </div>

        </div>

      </div>

      {/* Winner Overlay popup */}
      {winnerMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 text-center space-y-6 rounded-2xl border border-red-500/30">
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
              🏆 The Winner Is Selected!
            </span>
            
            <div className="flex gap-4 items-start bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-left">
              <img
                src={winnerMovie.poster}
                alt={winnerMovie.title}
                className="w-20 h-28 object-cover rounded-lg border border-zinc-800 shrink-0"
              />
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-lg text-white leading-tight">{winnerMovie.title}</h3>
                <p className="text-xs text-[#E50914] font-bold">{winnerMovie.year} • {winnerMovie.runtime} min</p>
                <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">{winnerMovie.overview}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  handlePlayTrailer(winnerMovie.trailer);
                  setWinnerMovie(null);
                }}
                className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-3 px-4 text-xs transition-colors btn-red-glow"
              >
                Watch Trailer
              </button>
              <button
                onClick={() => setWinnerMovie(null)}
                className="rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold py-3 px-6 text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trailer Modal Dialog */}
      {activeTrailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
            <button
              onClick={() => setActiveTrailerUrl(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 border border-white/10 p-2 text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <iframe
              src={activeTrailerUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
        </div>
      )}

    </div>
  );
}
