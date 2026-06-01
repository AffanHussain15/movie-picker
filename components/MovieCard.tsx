'use client';

import React, { useState } from 'react';
import { Play, Heart, HeartOff, ChevronDown, ChevronUp, Star, Clock, Globe } from 'lucide-react';
import { Movie } from '../lib/mockMovies';

interface MovieCardProps {
  movie: Movie & { matchScore?: number; aiExplanation?: string };
  isSaved?: boolean;
  onToggleWatchlist?: () => void;
  onPlayTrailer?: (trailerId: string) => void;
  showMatchDetails?: boolean;
}

export default function MovieCard({
  movie,
  isSaved = false,
  onToggleWatchlist,
  onPlayTrailer,
  showMatchDetails = true,
}: MovieCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A1A]/40 backdrop-blur-md transition-all duration-300 hover:border-[#E50914]/50 hover:shadow-[0_12px_40px_rgba(229,9,20,0.1)] flex flex-col md:flex-row h-full">
      {/* Poster */}
      <div className="relative w-full md:w-48 h-72 md:h-auto shrink-0 overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=60';
          }}
        />
        
        {/* Match Score Badge */}
        {showMatchDetails && movie.matchScore !== undefined && (
          <div className="absolute top-3 left-3 bg-[#E50914] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg border border-red-500 flex items-center gap-1 shadow-red-950/50">
            <span>{movie.matchScore}% Match</span>
          </div>
        )}

        {/* Action Button Overlays */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          {onPlayTrailer && (
            <button
              onClick={() => onPlayTrailer(movie.trailer)}
              className="p-3 rounded-full bg-[#E50914] text-white hover:bg-white hover:text-black transition-all transform hover:scale-110 shadow-lg"
              title="Watch Trailer"
            >
              <Play className="h-6 w-6 fill-current" />
            </button>
          )}
          {onToggleWatchlist && (
            <button
              onClick={onToggleWatchlist}
              className={`p-3 rounded-full border transition-all transform hover:scale-110 shadow-lg ${
                isSaved
                  ? 'bg-white border-white text-black hover:bg-[#E50914] hover:border-[#E50914] hover:text-white'
                  : 'bg-black/80 border-white/20 text-white hover:bg-white hover:text-black'
              }`}
              title={isSaved ? 'Remove from Watchlist' : 'Save to Watchlist'}
            >
              {isSaved ? <HeartOff className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Description Content */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2">
          {/* Title and Rating */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-1">
                {movie.title}
              </h3>
              <span className="text-xs text-zinc-400 font-medium">{movie.year} • {movie.mood}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-xs font-bold border border-yellow-500/20">
              <Star className="h-3.5 w-3.5 fill-current" />
              {movie.rating}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {movie.runtime}m
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {movie.language}
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {movie.genres.map((g, idx) => (
              <span
                key={idx}
                className="bg-zinc-800/80 border border-zinc-700/50 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Overview text */}
          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed pt-1">
            {movie.overview}
          </p>
        </div>

        {/* AI match description */}
        {showMatchDetails && movie.aiExplanation && (
          <div className="border-t border-[rgba(255,255,255,0.05)] pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <span>{expanded ? 'Hide Match Reason' : 'Why this matches?'}</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expanded && (
              <div className="mt-2.5 bg-zinc-950/40 rounded-lg p-3 border border-[rgba(255,255,255,0.04)] text-xs text-zinc-300 leading-normal animate-in slide-in-from-top-2 duration-200">
                <p className="whitespace-pre-line leading-relaxed">{movie.aiExplanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
