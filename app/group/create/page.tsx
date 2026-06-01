'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Trash2, ArrowRight, Film } from 'lucide-react';

export default function CreateGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>(['Ali', 'Ahmed', 'Sara']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = () => {
    if (memberNames.length >= 10) {
      setError('A group can have at most 10 members.');
      return;
    }
    setMemberNames([...memberNames, '']);
    setError('');
  };

  const handleRemoveMember = (index: number) => {
    if (memberNames.length <= 1) {
      setError('You need at least 1 member to create a group.');
      return;
    }
    const updated = memberNames.filter((_, idx) => idx !== index);
    setMemberNames(updated);
    setError('');
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...memberNames];
    updated[index] = val;
    setMemberNames(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Group Name is required.');
      return;
    }

    const filteredNames = memberNames.map((n) => n.trim()).filter(Boolean);
    if (filteredNames.length < 1) {
      setError('At least one member name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          memberCount: filteredNames.length,
          memberNames: filteredNames,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Direct route to the Group Dashboard
        router.push(`/group/${data.group.id}`);
      } else {
        setError(data.error || 'Failed to create group.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#0F0F0F] relative overflow-hidden py-16 px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E50914]/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 p-3 text-[#E50914] mb-2 animate-bounce">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Create Group</h1>
          <p className="text-xs text-zinc-400">
            Set up your group and invite friends to vote on movies
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Group Name</label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Friday Night, Family Couch Squad"
              className="w-full rounded-lg bg-zinc-900 border border-[rgba(255,255,255,0.08)] px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all"
            />
          </div>

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2">
              <label className="text-sm font-semibold text-zinc-300">Member Names</label>
              <button
                type="button"
                onClick={handleAddMember}
                className="flex items-center gap-1 text-xs font-bold text-[#E50914] hover:text-red-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {memberNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`Member ${index + 1} Name`}
                    className="flex-1 rounded-lg bg-zinc-900 border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    disabled={memberNames.length <= 1}
                    className="rounded-lg border border-[rgba(255,255,255,0.08)] p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E50914] hover:bg-[#B20710] text-white font-bold py-3 px-6 text-sm transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] disabled:opacity-50 btn-red-glow"
          >
            {isSubmitting ? 'Creating Group...' : 'Create Group'}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
