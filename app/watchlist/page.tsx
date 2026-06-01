'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Video, Play, X } from 'lucide-react';
import { Movie } from '../../lib/mockMovies';
import MovieCard from '../../components/MovieCard';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('movie_picker_watchlist');
      if (saved) {
        try {
          setWatchlist(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleRemove = (movieId: string) => {
    const updated = watchlist.filter((m) => m.id !== movieId);
    setWatchlist(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('movie_picker_watchlist', JSON.stringify(updated));
    }
  };

  const handlePlayTrailer = (trailerId: string) => {
    setActiveTrailerUrl(`https://www.youtube.com/embed/${trailerId}?autoplay=1`);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden py-16 px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-5xl space-y-8 z-10">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 p-2.5 text-[#E50914]">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Saved Watchlist</h1>
              <p className="text-xs text-zinc-400">Movies you have bookmarked for later viewing</p>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            {watchlist.length} {watchlist.length === 1 ? 'Movie' : 'Movies'} Saved
          </span>
        </div>

        {/* List */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-2xl border border-dashed border-zinc-800 bg-[#1A1A1A]/10">
            <div className="rounded-full bg-zinc-900 border border-zinc-800 p-4 text-zinc-500">
              <Heart className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Your Watchlist is empty</h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Browse movies in your group results, click the heart overlay on posters, and see them here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {watchlist.map((movie) => (
              <div key={movie.id} className="relative h-full">
                <MovieCard
                  movie={movie}
                  isSaved={true}
                  onToggleWatchlist={() => handleRemove(movie.id)}
                  onPlayTrailer={handlePlayTrailer}
                  showMatchDetails={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
