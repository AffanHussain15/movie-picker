'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Copy, Check, ChevronRight, Settings, Smartphone, Share2, HelpCircle, UserCheck } from 'lucide-react';
import { Group, Member, Preference } from '../../../lib/db/models';

const GENRES = [
  'Action', 'Comedy', 'Sci-Fi', 'Thriller', 'Adventure',
  'Drama', 'Horror', 'Romance', 'Mystery', 'Animation'
];

const MOODS = [
  'Funny', 'Exciting', 'Relaxing', 'Emotional',
  'Mind-Bending', 'Dark', 'Feel Good', 'Family Friendly'
];

const RUNTIMES = [
  { label: 'Under 90 Minutes', value: 'under-90' },
  { label: '90–120 Minutes', value: '90-120' },
  { label: '120+ Minutes', value: '120+' },
  { label: 'Any Length', value: 'any' }
];

const LANGUAGES = [
  'English', 'Hindi', 'Urdu', 'Korean', 'Japanese', 'Any'
];

export default function GroupDashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: groupId } = use(params);

  // States
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [couchMode, setCouchMode] = useState(true);
  
  // Active member (whose preferences are being edited)
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  // Form states for preferences
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState('Exciting');
  const [selectedLength, setSelectedLength] = useState('any');
  const [selectedLanguage, setSelectedLanguage] = useState('Any');
  const [minYear, setMinYear] = useState(1995);
  const [maxYear, setMaxYear] = useState(2026);
  const [isSubmittingPrefs, setIsSubmittingPrefs] = useState(false);

  // Poll for group updates (in Remote Mode)
  useEffect(() => {
    fetchGroup();
    let timer: NodeJS.Timeout;
    
    if (!couchMode) {
      timer = setInterval(() => {
        fetchGroup(false); // background fetch silently
      }, 3500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [groupId, couchMode]);

  const fetchGroup = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Pass the developer TMDB API key if set in localStorage
      const devTmdbKey = localStorage.getItem('tmdb_api_key') || '';
      const headers: Record<string, string> = {};
      if (devTmdbKey) {
        headers['x-tmdb-key'] = devTmdbKey;
      }

      const res = await fetch(`/api/groups/${groupId}`, { headers });
      const data = await res.json();
      
      if (data.success) {
        setGroup(data.group);
        setError('');
      } else {
        setError(data.error || 'Failed to load group details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please refresh.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/group/${groupId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Select which member to edit
  const handleSelectMember = (member: Member) => {
    setActiveMemberId(member.id);
    if (member.preferences) {
      setSelectedGenres(member.preferences.genres || []);
      setSelectedMood(member.preferences.mood || 'Exciting');
      setSelectedLength(member.preferences.runtime || 'any');
      setSelectedLanguage(member.preferences.language || 'Any');
      setMinYear(member.preferences.yearRange?.[0] ?? 1995);
      setMaxYear(member.preferences.yearRange?.[1] ?? 2026);
    } else {
      // Default reset
      setSelectedGenres([]);
      setSelectedMood('Exciting');
      setSelectedLength('any');
      setSelectedLanguage('Any');
      setMinYear(1995);
      setMaxYear(2026);
    }
  };

  const handleToggleGenre = (g: string) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMemberId) return;

    if (selectedGenres.length === 0) {
      alert('Please select at least one genre.');
      return;
    }

    setIsSubmittingPrefs(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: activeMemberId,
          preferences: {
            genres: selectedGenres,
            mood: selectedMood,
            runtime: selectedLength,
            language: selectedLanguage,
            yearRange: [minYear, maxYear],
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGroup(data.group);
        setActiveMemberId(null); // Return to list view
        // Scroll to member list
        document.getElementById('member-list-container')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to save preferences.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating preferences.');
    } finally {
      setIsSubmittingPrefs(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-t-[#E50914] border-zinc-800 animate-spin" />
        <p className="text-zinc-500 text-sm font-medium">Synchronizing session...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center px-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-500 max-w-sm">
          ⚠️ {error || 'Session not found. It may have expired.'}
        </div>
        <button
          onClick={() => router.push('/group/create')}
          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 text-sm transition-colors"
        >
          Create New Group
        </button>
      </div>
    );
  }

  const allSubmitted = group.members.every((m) => m.preferences);
  const submittedCount = group.members.filter((m) => m.preferences).length;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden py-12 px-4 sm:px-6">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 z-10">
        
        {/* Top Info Banner */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-[#E50914]">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider">Group Session Active</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">🎬 Group: {group.name}</h1>
            <p className="text-xs text-zinc-400">Invite Code: <span className="font-mono font-bold text-zinc-100">{group.id}</span></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            {/* Toggle Couch vs Remote */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0 justify-center">
              <button
                type="button"
                onClick={() => setCouchMode(true)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                  couchMode ? 'bg-[#E50914] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Couch Mode
              </button>
              <button
                type="button"
                onClick={() => setCouchMode(false)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                  !couchMode ? 'bg-[#E50914] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Share2 className="h-3.5 w-3.5" />
                Remote Link
              </button>
            </div>

            {/* Invite Button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white font-bold py-2.5 px-5 text-xs transition-colors shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied Link!' : 'Copy Share Link'}
            </button>
          </div>
        </div>

        {/* Setup instruction */}
        {!couchMode && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs text-zinc-400 flex gap-2 items-center leading-normal">
            <Share2 className="h-5 w-5 text-[#E50914] shrink-0" />
            <span>
              **Remote Link Mode:** Share this page URL with group members. They can open it on their devices to submit their own preferences. This board will refresh automatically!
            </span>
          </div>
        )}

        {/* Member list cards */}
        <div id="member-list-container" className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            👥 Members Preferences ({submittedCount}/{group.memberCount} Submitted)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {group.members.map((member) => (
              <div
                key={member.id}
                onClick={() => !activeMemberId && handleSelectMember(member)}
                className={`glass-panel rounded-xl p-5 border flex flex-col justify-between h-40 transition-all ${
                  !activeMemberId ? 'cursor-pointer hover:border-[#E50914]/50 hover:bg-zinc-800/50' : 'opacity-60'
                } ${member.preferences ? 'border-green-500/20' : 'border-zinc-800'}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-bold text-base text-white">{member.name}</span>
                  {member.preferences ? (
                    <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400 flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      Submitted
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-500">
                      Pending
                    </span>
                  )}
                </div>

                {member.preferences ? (
                  <div className="text-xs text-zinc-400 space-y-1 mt-3">
                    <p className="line-clamp-1">🍿 {member.preferences.genres.join(', ')}</p>
                    <p>🎭 Mood: {member.preferences.mood}</p>
                    <p>⏱️ Run: {RUNTIMES.find(r => r.value === member.preferences?.runtime)?.label || 'Any'}</p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 mt-auto italic">Click to enter preferences</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global actions (when all submitted) */}
        {allSubmitted && (
          <div className="glass-panel rounded-2xl p-6 text-center space-y-4 border border-green-500/20 bg-green-500/5 animate-bounce">
            <h3 className="text-lg font-bold text-white">🎉 Everyone Submitted Preferences!</h3>
            <p className="text-xs text-zinc-400">The matches have been calculated. Choose how to decide:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/group/${groupId}/results`)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-3 px-6 text-sm transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] btn-red-glow"
              >
                View Recommended Results
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => router.push(`/group/${groupId}/swipe`)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#1A1A1A] hover:bg-zinc-800 text-white font-bold py-3 px-6 text-sm transition-all"
              >
                Enter Swipe Deck (Vote)
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* Form view (if a member is selected) */}
        {activeMemberId && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border-[#E50914]/40 scroll-mt-24" id="pref-form">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <div>
                <span className="text-xs font-bold text-[#E50914] uppercase">Entering Preferences</span>
                <h3 className="text-lg font-bold text-white">
                  🍿 Taste Profile: {group.members.find((m) => m.id === activeMemberId)?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMemberId(null)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              
              {/* Genres Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Select Genres (Choose as many as you like)
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleToggleGenre(g)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#E50914] border-[#E50914] text-white shadow-[0_0_10px_rgba(229,9,20,0.3)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mood Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  What's the Mood? (Select one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => {
                    const isSelected = selectedMood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMood(m)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#E50914] border-[#E50914] text-white shadow-[0_0_10px_rgba(229,9,20,0.3)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Movie Length */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Movie Length</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RUNTIMES.map((r) => {
                    const isSelected = selectedLength === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setSelectedLength(r.value)}
                        className={`rounded-xl border p-3.5 text-center text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                          isSelected
                            ? 'bg-[#E50914]/10 border-[#E50914] text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Preferred Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setSelectedLanguage(lang)}
                        className={`rounded-xl border py-2 text-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#E50914]/10 border-[#E50914] text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Release Year Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm font-semibold text-zinc-300">
                  <span>Release Year Range</span>
                  <span className="text-xs font-mono font-bold text-[#E50914]">
                    {minYear} - {maxYear}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <span className="text-[11px] text-zinc-500">Min Year</span>
                      <input
                        type="range"
                        min="1980"
                        max="2026"
                        value={minYear}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val <= maxYear) setMinYear(val);
                        }}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[11px] text-zinc-500">Max Year</span>
                      <input
                        type="range"
                        min="1980"
                        max="2026"
                        value={maxYear}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= minYear) setMaxYear(val);
                        }}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form submit */}
              <div className="flex gap-3 pt-4 justify-end border-t border-[rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  onClick={() => setActiveMemberId(null)}
                  className="rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 px-5 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPrefs}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-2.5 px-6 text-xs transition-all shadow-[0_0_10px_rgba(229,9,20,0.3)] btn-red-glow"
                >
                  {isSubmittingPrefs ? 'Saving Profile...' : 'Save Preferences'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
