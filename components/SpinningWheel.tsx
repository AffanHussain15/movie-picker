'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Movie } from '../lib/mockMovies';

interface SpinningWheelProps {
  movies: Movie[];
  onWinner: (movie: Movie) => void;
}

const COLORS = [
  '#E50914', // Brand Red
  '#1F1F1F', // Dark Gray
  '#B20710', // Darker Red
  '#2D2D2D', // Light Gray
  '#FF3E3E', // Vivid Red
  '#404040', // Neutral Gray
  '#990000', // Crimson
  '#121212', // Near Black
];

export default function SpinningWheel({ movies, onWinner }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [winner, setWinner] = useState<Movie | null>(null);

  // We only use the top 8 recommended movies on the wheel to keep it readable
  const wheelMovies = movies.slice(0, 8);
  const segmentCount = wheelMovies.length;
  const segmentAngle = (2 * Math.PI) / segmentCount;

  // Synthesize sound tick using Web Audio API
  const playTick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext blocked by user gesture or unsupported
    }
  };

  const drawWheel = (currentAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context to rotate
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentAngle);

    // Draw Segments
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 10, startAngle, endAngle);
      ctx.closePath();

      // Colors
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // Add segment border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Movie Titles text
      ctx.save();
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      
      // Truncate title
      const title = wheelMovies[i].title;
      const displayTitle = title.length > 18 ? title.slice(0, 16) + '..' : title;
      ctx.fillText(displayTitle, radius - 30, 4);
      ctx.restore();
    }

    ctx.restore();

    // Draw Outer Rim
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E50914';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Draw Inner Circle Center Pin
    ctx.beginPath();
    ctx.arc(radius, radius, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F0F0F';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Indicator Arrow at top (pointing down)
    ctx.fillStyle = '#E50914';
    ctx.beginPath();
    ctx.moveTo(radius - 12, 10);
    ctx.lineTo(radius + 12, 10);
    ctx.lineTo(radius, 32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(angle);
  }, [movies, angle]);

  const spin = () => {
    if (isSpinning || segmentCount === 0) return;
    setIsSpinning(true);
    setWinner(null);

    const spinPower = 8 + Math.random() * 8; // Random speed factor
    let currentSpeed = spinPower;
    let currentAngle = angle;
    const friction = 0.985; // Slow down friction rate

    let lastTickAngleIndex = -1;

    const animate = () => {
      currentAngle += currentSpeed * (Math.PI / 180);
      currentSpeed *= friction;

      // Click sound on segment transition
      const relativeAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSegmentIndex = Math.floor(((2 * Math.PI - relativeAngle) % (2 * Math.PI)) / segmentAngle);
      if (currentSegmentIndex !== lastTickAngleIndex) {
        playTick();
        lastTickAngleIndex = currentSegmentIndex;
      }

      setAngle(currentAngle);
      drawWheel(currentAngle);

      if (currentSpeed < 0.05) {
        setIsSpinning(false);
        // Calculate Winner
        // In screen coordinates, the pointer is at top (-PI/2)
        // Draw segment is relative to currentAngle
        const finalAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at angle 3*PI/2 (top). 
        // Segment index is determined by checking which offset matches top.
        const pointerAngle = 1.5 * Math.PI; 
        const winningIndex = Math.floor(
          ((pointerAngle - finalAngle + 4 * Math.PI) % (2 * Math.PI)) / segmentAngle
        );
        const winningMovie = wheelMovies[winningIndex];

        setWinner(winningMovie);
        onWinner(winningMovie);
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="rounded-full shadow-[0_0_50px_rgba(229,9,20,0.15)] bg-zinc-950"
        />
        {/* Glow center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E50914] shadow-[0_0_10px_#E50914] pointer-events-none" />
      </div>

      <div className="flex gap-4">
        <button
          onClick={spin}
          disabled={isSpinning || segmentCount === 0}
          className="flex items-center gap-2 rounded-full bg-[#E50914] hover:bg-[#B20710] disabled:opacity-40 disabled:hover:bg-[#E50914] text-white font-bold py-3 px-8 transition-all duration-300 shadow-[0_0_20px_rgba(229,9,20,0.4)] btn-red-glow"
        >
          <Play className="h-5 w-5 fill-current" />
          {isSpinning ? "Selecting Movie..." : "Spin the Wheel!"}
        </button>

        {winner && (
          <button
            onClick={() => {
              setWinner(null);
              setAngle(0);
              drawWheel(0);
            }}
            className="flex items-center gap-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 transition-all duration-300"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </button>
        )}
      </div>

      {winner && (
        <div className="w-full max-w-sm rounded-xl border border-red-900 bg-red-950/30 p-4 text-center animate-bounce">
          <span className="text-sm font-semibold tracking-wider text-red-500 uppercase">
            🎉 The Wheel Decided!
          </span>
          <h3 className="text-xl font-bold text-white mt-1">{winner.title}</h3>
          <p className="text-xs text-zinc-400 mt-1">Released in {winner.year} • {winner.runtime} min</p>
        </div>
      )}
    </div>
  );
}
